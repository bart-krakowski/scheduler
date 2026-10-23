import { lagMs, requiredShiftMs } from "./shift.js";
import { describeDependencyViolation } from "./validateDependencies.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/validation/dependency/anchors.ts
function findAnchoredViolations(input) {
	const { events, timeZone } = input;
	const changed = new Set(input.changedIds);
	if (changed.size === 0) return [];
	const byId = new Map(events.map((e) => [e.id, e]));
	const epochMs = (value) => Temporal.PlainDateTime.from(value).toZonedDateTime(timeZone).epochMilliseconds;
	const conflicts = [];
	for (const successor of events) for (const link of successor.dependsOn ?? []) {
		const predecessor = byId.get(link.id);
		if (!predecessor) continue;
		const anchor = successor.manuallyScheduled ? successor : predecessor.manuallyScheduled ? predecessor : null;
		if (!anchor) continue;
		if (!changed.has(successor.id) && !changed.has(predecessor.id)) continue;
		if (requiredShiftMs(link.type, epochMs(predecessor.start), epochMs(predecessor.end), epochMs(successor.start), epochMs(successor.end), lagMs(link)) <= 0) continue;
		conflicts.push({
			eventId: successor.id,
			eventTitle: successor.title,
			predecessorId: predecessor.id,
			predecessorTitle: predecessor.title,
			type: link.type,
			message: `${describeDependencyViolation(successor.title, predecessor.title, link)} — "${anchor.title}" is manually scheduled`,
			originalStart: successor.start,
			originalEnd: successor.end,
			anchorId: anchor.id
		});
	}
	return conflicts;
}

//#endregion
export { findAnchoredViolations };
//# sourceMappingURL=anchors.js.map