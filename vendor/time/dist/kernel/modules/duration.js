import { toPlainDateTimeString } from "../../date/parse/parse.js";
import { checkDuration, workingMinutesBetween } from "../../validation/duration/checkDuration.js";

//#region src/kernel/modules/duration.ts
function toConflict(conflict) {
	return {
		code: `duration/${conflict.reason}`,
		message: conflict.message,
		eventIds: [conflict.eventId],
		detail: conflict
	};
}
function durationModule(options) {
	const knownResources = () => typeof options.resources === "function" ? options.resources() : options.resources;
	const workingTime = () => typeof options.workingTime === "function" ? options.workingTime() : options.workingTime;
	const resolveResources = (resources) => {
		const known = knownResources();
		return (resources ?? []).map((resource) => typeof resource === "string" ? known.find((candidate) => candidate.id === resource) ?? { id: resource } : resource);
	};
	const evaluate = (event) => checkDuration({
		event: {
			id: event.id,
			title: event.title ?? event.id,
			start: toPlainDateTimeString(event.start),
			end: toPlainDateTimeString(event.end),
			calendarId: event.calendarId,
			duration: event.duration,
			effort: event.effort
		},
		resources: resolveResources(event.resources),
		workingTime: workingTime()
	});
	return {
		name: "duration",
		api: () => ({
			evaluateDuration: (event) => evaluate(event),
			getWorkingDuration: (range) => workingMinutesBetween({
				start: toPlainDateTimeString(range.start),
				end: toPlainDateTimeString(range.end)
			}, resolveResources(range.resources), workingTime(), range.calendarId)
		}),
		contributions: [{
			pipeline: "write",
			kind: "validate",
			stage: "duration-validate",
			priority: options.priority,
			run: (batch) => {
				const conflicts = [];
				for (const op of batch.ops) {
					if (op.kind === "remove" || op.kind === "intent") continue;
					const event = op.kind === "add" ? op.event : op.after;
					for (const conflict of evaluate(event)) conflicts.push(toConflict(conflict));
				}
				return conflicts;
			}
		}]
	};
}

//#endregion
export { durationModule };
//# sourceMappingURL=duration.js.map