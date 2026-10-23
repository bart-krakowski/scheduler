const require_shift = require('./shift.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/validation/dependency/propagate.ts
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
function positionsOf(events) {
	return new Map(events.map((e) => [e.id, {
		start: e.start,
		end: e.end
	}]));
}
function shiftToSatisfyLink(input) {
	const predecessorMs = toMs(input.predecessor, input.timeZone);
	const successorMs = toMs(input.successor, input.timeZone);
	const shiftMs = require_shift.requiredShiftMs(input.type, predecessorMs.startMs, predecessorMs.endMs, successorMs.startMs, successorMs.endMs, require_shift.lagMs(input));
	if (shiftMs <= 0) return null;
	return shiftSpan(input.successor, shiftMs);
}
function propagateToPredecessors(input) {
	const { sourceId, events, timeZone } = input;
	const visited = input.visited ?? /* @__PURE__ */ new Set();
	const byId = new Map(events.map((e) => [e.id, e]));
	const positions = positionsOf(events);
	const shifts = [];
	const walk = (currentId) => {
		const current = byId.get(currentId);
		const currentSpan = positions.get(currentId);
		if (!current?.dependsOn?.length || !currentSpan) return;
		const currentMs = toMs(currentSpan, timeZone);
		for (const dep of current.dependsOn) {
			if (visited.has(dep.id)) continue;
			const predSpan = positions.get(dep.id);
			if (!predSpan) continue;
			if (byId.get(dep.id)?.manuallyScheduled) {
				visited.add(dep.id);
				continue;
			}
			const predMs = toMs(predSpan, timeZone);
			const pullBackMs = require_shift.requiredShiftMs(dep.type, predMs.startMs, predMs.endMs, currentMs.startMs, currentMs.endMs, require_shift.lagMs(dep));
			if (pullBackMs <= 0) continue;
			visited.add(dep.id);
			const moved = shiftSpan(predSpan, -pullBackMs);
			positions.set(dep.id, moved);
			shifts.push({
				id: dep.id,
				newStart: moved.start,
				newEnd: moved.end
			});
			walk(dep.id);
		}
	};
	walk(sourceId);
	return shifts;
}
function propagateToDependents(input) {
	const { sourceId, events, timeZone } = input;
	const visited = input.visited ?? /* @__PURE__ */ new Set();
	const byId = new Map(events.map((e) => [e.id, e]));
	const positions = positionsOf(events);
	const shifts = [];
	const successors = /* @__PURE__ */ new Map();
	for (const event of events) for (const dep of event.dependsOn ?? []) {
		const list = successors.get(dep.id);
		if (list) list.push(event.id);
		else successors.set(dep.id, [event.id]);
	}
	const walk = (currentId) => {
		const currentSpan = positions.get(currentId);
		const successorIds = successors.get(currentId);
		if (!currentSpan || !successorIds?.length) return;
		const currentMs = toMs(currentSpan, timeZone);
		for (const successorId of successorIds) {
			if (visited.has(successorId)) continue;
			const successor = byId.get(successorId);
			const successorSpan = positions.get(successorId);
			if (!successor || !successorSpan) continue;
			if (successor.manuallyScheduled) {
				visited.add(successorId);
				continue;
			}
			const link = successor.dependsOn?.find((d) => d.id === currentId);
			if (!link) continue;
			visited.add(successorId);
			const successorMs = toMs(successorSpan, timeZone);
			const shiftMs = require_shift.requiredShiftMs(link.type, currentMs.startMs, currentMs.endMs, successorMs.startMs, successorMs.endMs, require_shift.lagMs(link));
			if (shiftMs <= 0) continue;
			const moved = shiftSpan(successorSpan, shiftMs);
			positions.set(successorId, moved);
			shifts.push({
				id: successorId,
				newStart: moved.start,
				newEnd: moved.end
			});
			walk(successorId);
		}
	};
	walk(sourceId);
	return shifts;
}

//#endregion
exports.propagateToDependents = propagateToDependents;
exports.propagateToPredecessors = propagateToPredecessors;
exports.shiftToSatisfyLink = shiftToSatisfyLink;
//# sourceMappingURL=propagate.cjs.map