import { formatLagMinutes, lagMs, requiredShiftMs } from "./shift.js";
import { Temporal } from "@js-temporal/polyfill";

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
	const lag = link.lag ? ` ${formatLagMinutes(link.lag)}` : "";
	return `"${successorTitle}" ${`${REASON[link.type]}"${predecessorTitle}"${ANCHOR[link.type]}${lag}`} (${link.type})`;
}
function validateDependencies(input) {
	const { event, dependsOn, events, timeZone } = input;
	if (events.length === 0) return [];
	const byId = new Map(events.map((e) => [e.id, e]));
	const newStartMs = Temporal.PlainDateTime.from(event.start).toZonedDateTime(timeZone).epochMilliseconds;
	const newEndMs = Temporal.PlainDateTime.from(event.end).toZonedDateTime(timeZone).epochMilliseconds;
	for (const dep of dependsOn) {
		const pred = byId.get(dep.id);
		if (!pred) continue;
		const predStartMs = Temporal.PlainDateTime.from(pred.start).toZonedDateTime(timeZone).epochMilliseconds;
		const predEndMs = Temporal.PlainDateTime.from(pred.end).toZonedDateTime(timeZone).epochMilliseconds;
		if (requiredShiftMs(dep.type, predStartMs, predEndMs, newStartMs, newEndMs, lagMs(dep)) > 0) return [{
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
export { describeDependencyViolation, validateDependencies };
//# sourceMappingURL=validateDependencies.js.map