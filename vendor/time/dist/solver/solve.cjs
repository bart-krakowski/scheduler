const require_skew = require('../workingTime/skew.cjs');
const require_clamp = require('../validation/constraints/clamp.cjs');
const require_checkDuration = require('../validation/duration/checkDuration.cjs');
const require_shift = require('../validation/dependency/shift.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/solver/solve.ts
function toMs(span, timeZone) {
	return {
		startMs: _js_temporal_polyfill.Temporal.PlainDateTime.from(span.start).toZonedDateTime(timeZone).epochMilliseconds,
		endMs: _js_temporal_polyfill.Temporal.PlainDateTime.from(span.end).toZonedDateTime(timeZone).epochMilliseconds
	};
}
function shiftSpan(span, ms) {
	return {
		start: _js_temporal_polyfill.Temporal.PlainDateTime.from(span.start).add({ milliseconds: ms }).toString({ smallestUnit: "second" }),
		end: _js_temporal_polyfill.Temporal.PlainDateTime.from(span.end).add({ milliseconds: ms }).toString({ smallestUnit: "second" })
	};
}
function findCycle(events, dependencies) {
	const successors = /* @__PURE__ */ new Map();
	for (const dep of dependencies) {
		const list = successors.get(dep.predecessorId);
		if (list) list.push(dep.successorId);
		else successors.set(dep.predecessorId, [dep.successorId]);
	}
	const state = /* @__PURE__ */ new Map();
	const stack = [];
	const visit = (id) => {
		state.set(id, "visiting");
		stack.push(id);
		for (const nextId of successors.get(id) ?? []) {
			if (state.get(nextId) === "visiting") return stack.slice(stack.indexOf(nextId));
			if (state.get(nextId) === "done") continue;
			const cycle = visit(nextId);
			if (cycle) return cycle;
		}
		stack.pop();
		state.set(id, "done");
		return null;
	};
	for (const event of events) {
		if (state.has(event.id)) continue;
		const cycle = visit(event.id);
		if (cycle) return cycle;
	}
	return null;
}
function solve(request) {
	const { events, dependencies, timeZone } = request;
	const workingTime = request.workingTime ?? {};
	const calendars = workingTime.calendars;
	const direction = request.direction ?? "ASAP";
	const anchors = new Set(request.anchors ?? []);
	for (const event of events) if (event.manuallyScheduled) anchors.add(event.id);
	const layersById = /* @__PURE__ */ new Map();
	const durationById = /* @__PURE__ */ new Map();
	for (const event of events) {
		const layers = require_checkDuration.resolveWorkingLayers(event.resources ?? [], workingTime, event.calendarId);
		layersById.set(event.id, layers);
		durationById.set(event.id, event.duration ?? require_checkDuration.workingMinutesBetween({
			start: event.start,
			end: event.end
		}, event.resources ?? [], workingTime, event.calendarId));
	}
	const conflicts = [];
	const cycle = findCycle(events, dependencies);
	const cycleIds = new Set(cycle ?? []);
	if (cycle) conflicts.push({
		code: "cycle",
		eventIds: cycle,
		message: `dependency cycle: ${cycle.join(" -> ")}`
	});
	const positions = new Map(events.map((event) => [event.id, {
		start: event.start,
		end: event.end
	}]));
	const baseline = new Map(positions);
	const movedFromBaseline = (id) => {
		const at = baseline.get(id);
		const now = positions.get(id);
		if (!at || !now) return false;
		return at.start !== now.start || at.end !== now.end;
	};
	const shortfallOf = (dep) => {
		const pred = positions.get(dep.predecessorId);
		const succ = positions.get(dep.successorId);
		if (!pred || !succ) return 0;
		const predMs = toMs(pred, timeZone);
		const succMs = toMs(succ, timeZone);
		return require_shift.requiredShiftMs(dep.type, predMs.startMs, predMs.endMs, succMs.startMs, succMs.endMs, require_shift.lagMs(dep));
	};
	const relaxable = [];
	for (const dep of dependencies) {
		if (cycleIds.has(dep.predecessorId) && cycleIds.has(dep.successorId)) continue;
		const succAnchored = anchors.has(dep.successorId);
		const predAnchored = anchors.has(dep.predecessorId);
		if (succAnchored && predAnchored) {
			if (shortfallOf(dep) > 0) conflicts.push({
				code: "unsatisfiable",
				eventIds: [dep.predecessorId, dep.successorId],
				message: `"${dep.successorId}" and "${dep.predecessorId}" are both fixed and violate a ${dep.type} dependency`
			});
			continue;
		}
		relaxable.push(dep);
	}
	const cap = events.length + 1;
	let stalled = false;
	const unschedulable = /* @__PURE__ */ new Set();
	for (let iteration = 0; iteration < cap; iteration++) {
		let changed = false;
		const reportUnschedulable = (eventId) => {
			if (unschedulable.has(eventId)) return;
			unschedulable.add(eventId);
			conflicts.push({
				code: "unsatisfiable",
				eventIds: [eventId],
				message: `"${eventId}" has no working time to schedule into`
			});
		};
		for (const dep of relaxable) {
			const shortfall = shortfallOf(dep);
			if (shortfall <= 0) continue;
			const succAnchored = anchors.has(dep.successorId);
			const predAnchored = anchors.has(dep.predecessorId);
			let pullPredecessorBackward;
			if (succAnchored) pullPredecessorBackward = true;
			else if (predAnchored) pullPredecessorBackward = false;
			else {
				const predMoved = movedFromBaseline(dep.predecessorId);
				const succMoved = movedFromBaseline(dep.successorId);
				pullPredecessorBackward = predMoved && !succMoved ? false : succMoved && !predMoved ? true : direction === "ALAP";
			}
			if (pullPredecessorBackward) {
				const pulled = shiftSpan(positions.get(dep.predecessorId), -shortfall);
				const layers = layersById.get(dep.predecessorId);
				const snappedEnd = require_skew.previousWorkingInstant(pulled.end, layers, calendars);
				if (snappedEnd === null) {
					reportUnschedulable(dep.predecessorId);
					continue;
				}
				const snappedStart = require_skew.subtractWorkingMinutes(snappedEnd, durationById.get(dep.predecessorId), layers, calendars);
				positions.set(dep.predecessorId, {
					start: snappedStart ?? pulled.start,
					end: snappedEnd
				});
				changed = true;
				continue;
			}
			const pushed = shiftSpan(positions.get(dep.successorId), shortfall);
			const layers = layersById.get(dep.successorId);
			const snappedStart = require_skew.nextWorkingInstant(pushed.start, layers, calendars);
			if (snappedStart === null) {
				reportUnschedulable(dep.successorId);
				continue;
			}
			const snappedEnd = require_skew.addWorkingMinutes(snappedStart, durationById.get(dep.successorId), layers, calendars);
			positions.set(dep.successorId, {
				start: snappedStart,
				end: snappedEnd ?? pushed.end
			});
			changed = true;
		}
		for (const event of events) {
			if (!event.constraint || anchors.has(event.id)) continue;
			const span = positions.get(event.id);
			const clamped = require_clamp.clampToConstraint(span, event.constraint);
			if (clamped !== span) {
				positions.set(event.id, clamped);
				changed = true;
			}
		}
		if (!changed) break;
		stalled = iteration === cap - 1;
	}
	if (stalled) conflicts.push({
		code: "unsatisfiable",
		eventIds: [...new Set(relaxable.flatMap((dep) => [dep.predecessorId, dep.successorId]))],
		message: "schedule did not converge within the iteration cap"
	});
	return {
		events: events.map((event) => ({
			...event,
			...positions.get(event.id)
		})),
		conflicts
	};
}

//#endregion
exports.solve = solve;
//# sourceMappingURL=solve.cjs.map