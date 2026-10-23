import { toPlainDateTimeString } from "../../date/parse/parse.js";
import { validateDependencies } from "../../validation/dependency/validateDependencies.js";
import { findAnchoredViolations } from "../../validation/dependency/anchors.js";
import { solve } from "../../solver/solve.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/kernel/modules/dependency.ts
function epochMs(value, timeZone) {
	return Temporal.PlainDateTime.from(toPlainDateTimeString(value)).toZonedDateTime(timeZone).epochMilliseconds;
}
function toGraph(events) {
	return events.map((e) => ({
		id: e.id,
		title: e.title ?? e.id,
		start: toPlainDateTimeString(e.start),
		end: toPlainDateTimeString(e.end),
		dependsOn: e.dependsOn,
		manuallyScheduled: e.manuallyScheduled
	}));
}
function toConflict(conflict) {
	return {
		code: "dependency/manually-scheduled",
		message: conflict.message,
		eventIds: [conflict.eventId, conflict.predecessorId],
		detail: conflict
	};
}
function dependenciesOf(events) {
	return events.flatMap((event) => (event.dependsOn ?? []).map((dep) => ({
		predecessorId: dep.id,
		successorId: event.id,
		type: dep.type,
		lag: dep.lag
	})));
}
function dependencyModule(options = {}) {
	const timeZone = options.timeZone ?? "UTC";
	return {
		name: "dependency",
		api: (ctx) => ({ validateEventDependencies: (event, dependsOn) => {
			const [conflict] = validateDependencies({
				event,
				dependsOn,
				events: toGraph(ctx.getEvents()),
				timeZone
			});
			if (!conflict) return { valid: true };
			return {
				valid: false,
				error: {
					eventId: conflict.eventId,
					eventTitle: conflict.eventTitle,
					reason: "blocked",
					message: conflict.message,
					originalStart: conflict.originalStart,
					originalEnd: conflict.originalEnd
				}
			};
		} }),
		contributions: [{
			pipeline: "write",
			kind: "transform",
			stage: "schedule",
			priority: options.priority,
			run: (batch, ctx) => {
				const movedIds = /* @__PURE__ */ new Set();
				for (const op of batch.ops) {
					if (op.kind !== "update") continue;
					const startChanged = epochMs(op.after.start, timeZone) !== epochMs(op.before.start, timeZone);
					const endChanged = epochMs(op.after.end, timeZone) !== epochMs(op.before.end, timeZone);
					if (startChanged || endChanged) movedIds.add(op.id);
				}
				if (movedIds.size === 0) return batch;
				const byId = new Map(toGraph(ctx.getEvents()).map((event) => [event.id, event]));
				for (const op of batch.ops) {
					if (op.kind !== "update" || !movedIds.has(op.id)) continue;
					const after = op.after;
					byId.set(op.id, {
						...byId.get(op.id),
						start: toPlainDateTimeString(after.start),
						end: toPlainDateTimeString(after.end)
					});
				}
				const graph = [...byId.values()];
				const anchors = graph.filter((event) => movedIds.has(event.id) || event.manuallyScheduled).map((event) => event.id);
				const result = solve({
					events: graph.map((event) => ({
						id: event.id,
						start: event.start,
						end: event.end,
						manuallyScheduled: event.manuallyScheduled
					})),
					dependencies: dependenciesOf(graph),
					anchors,
					timeZone
				});
				const extraOps = [];
				for (const solved of result.events) {
					if (movedIds.has(solved.id)) continue;
					const baseline = byId.get(solved.id);
					if (solved.start === baseline.start && solved.end === baseline.end) continue;
					const before = ctx.getEvent(solved.id);
					if (!before) continue;
					extraOps.push({
						kind: "update",
						id: solved.id,
						before,
						after: {
							...before,
							start: solved.start,
							end: solved.end
						}
					});
				}
				if (extraOps.length === 0) return batch;
				return {
					...batch,
					ops: [...batch.ops, ...extraOps]
				};
			}
		}, {
			pipeline: "write",
			kind: "validate",
			stage: "dependency-validate",
			priority: options.priority,
			run: (batch, ctx) => {
				const settled = new Map(ctx.getEvents().map((e) => [e.id, e]));
				const changedIds = /* @__PURE__ */ new Set();
				for (const op of batch.ops) {
					if (op.kind === "intent") continue;
					if (op.kind === "remove") {
						settled.delete(op.id);
						changedIds.add(op.id);
					} else if (op.kind === "add") {
						settled.set(op.event.id, op.event);
						changedIds.add(op.event.id);
					} else {
						settled.set(op.id, op.after);
						changedIds.add(op.id);
					}
				}
				return findAnchoredViolations({
					events: toGraph([...settled.values()]),
					changedIds,
					timeZone
				}).map(toConflict);
			}
		}]
	};
}

//#endregion
export { dependencyModule };
//# sourceMappingURL=dependency.js.map