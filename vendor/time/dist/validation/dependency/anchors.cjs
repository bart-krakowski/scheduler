const require_shift = require('./shift.cjs');
const require_validateDependencies = require('./validateDependencies.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/validation/dependency/anchors.ts
function findAnchoredViolations(input) {
	const { events, timeZone } = input;
	const changed = new Set(input.changedIds);
	if (changed.size === 0) return [];
	const byId = new Map(events.map((e) => [e.id, e]));
	const epochMs = (value) => _js_temporal_polyfill.Temporal.PlainDateTime.from(value).toZonedDateTime(timeZone).epochMilliseconds;
	const conflicts = [];
	for (const successor of events) for (const link of successor.dependsOn ?? []) {
		const predecessor = byId.get(link.id);
		if (!predecessor) continue;
		const anchor = successor.manuallyScheduled ? successor : predecessor.manuallyScheduled ? predecessor : null;
		if (!anchor) continue;
		if (!changed.has(successor.id) && !changed.has(predecessor.id)) continue;
		if (require_shift.requiredShiftMs(link.type, epochMs(predecessor.start), epochMs(predecessor.end), epochMs(successor.start), epochMs(successor.end), require_shift.lagMs(link)) <= 0) continue;
		conflicts.push({
			eventId: successor.id,
			eventTitle: successor.title,
			predecessorId: predecessor.id,
			predecessorTitle: predecessor.title,
			type: link.type,
			message: `${require_validateDependencies.describeDependencyViolation(successor.title, predecessor.title, link)} — "${anchor.title}" is manually scheduled`,
			originalStart: successor.start,
			originalEnd: successor.end,
			anchorId: anchor.id
		});
	}
	return conflicts;
}

//#endregion
exports.findAnchoredViolations = findAnchoredViolations;
//# sourceMappingURL=anchors.cjs.map