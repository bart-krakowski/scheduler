const require_shift = require('./shift.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/validation/dependency/validateDependencies.ts
const REASON = {
	FS: "cannot start before ",
	SS: "cannot start before ",
	FF: "cannot end before ",
	SF: "cannot end before "
};
const ANCHOR = {
	FS: " ends",
	SS: " starts",
	FF: " ends",
	SF: " starts"
};
function describeDependencyViolation(successorTitle, predecessorTitle, link) {
	const lag = link.lag ? ` ${require_shift.formatLagMinutes(link.lag)}` : "";
	return `"${successorTitle}" ${`${REASON[link.type]}"${predecessorTitle}"${ANCHOR[link.type]}${lag}`} (${link.type})`;
}
function validateDependencies(input) {
	const { event, dependsOn, events, timeZone } = input;
	if (events.length === 0) return [];
	const byId = new Map(events.map((e) => [e.id, e]));
	const newStartMs = _js_temporal_polyfill.Temporal.PlainDateTime.from(event.start).toZonedDateTime(timeZone).epochMilliseconds;
	const newEndMs = _js_temporal_polyfill.Temporal.PlainDateTime.from(event.end).toZonedDateTime(timeZone).epochMilliseconds;
	for (const dep of dependsOn) {
		const pred = byId.get(dep.id);
		if (!pred) continue;
		const predStartMs = _js_temporal_polyfill.Temporal.PlainDateTime.from(pred.start).toZonedDateTime(timeZone).epochMilliseconds;
		const predEndMs = _js_temporal_polyfill.Temporal.PlainDateTime.from(pred.end).toZonedDateTime(timeZone).epochMilliseconds;
		if (require_shift.requiredShiftMs(dep.type, predStartMs, predEndMs, newStartMs, newEndMs, require_shift.lagMs(dep)) > 0) return [{
			eventId: event.id ?? "",
			eventTitle: event.title,
			predecessorId: pred.id,
			predecessorTitle: pred.title,
			type: dep.type,
			message: describeDependencyViolation(event.title, pred.title, dep),
			originalStart: event.start,
			originalEnd: event.end
		}];
	}
	return [];
}

//#endregion
exports.describeDependencyViolation = describeDependencyViolation;
exports.validateDependencies = validateDependencies;
//# sourceMappingURL=validateDependencies.cjs.map