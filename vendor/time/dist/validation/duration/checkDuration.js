import { getLayeredWorkingTime, hasAnyWorkingCalendar } from "../../workingTime/resolve.js";
import { effectiveCalendarId } from "../availability/time.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/validation/duration/checkDuration.ts
function wallClockMinutes(start, end) {
	return Temporal.PlainDateTime.from(start).until(Temporal.PlainDateTime.from(end)).total({ unit: "minute" });
}
function resolveWorkingLayers(resources, workingTime, eventCalendarId) {
	return (resources.length > 0 ? resources.map((resource) => effectiveCalendarId(resource, workingTime)) : [workingTime.defaultCalendarId]).map((base) => [base, eventCalendarId]);
}
function workingMinutesBetween(range, resources, workingTime, eventCalendarId) {
	if (range.end <= range.start) return 0;
	const layers = resolveWorkingLayers(resources, workingTime, eventCalendarId);
	const calendars = workingTime.calendars;
	if (!hasAnyWorkingCalendar(layers.flat(), calendars)) return wallClockMinutes(range.start, range.end);
	return getLayeredWorkingTime(layers, range, calendars).reduce((total, span) => total + wallClockMinutes(span.start, span.end), 0);
}
function checkDuration(input) {
	const { event } = input;
	if (event.duration === void 0 && event.effort === void 0) return [];
	const actual = workingMinutesBetween({
		start: event.start,
		end: event.end
	}, input.resources ?? [], input.workingTime, event.calendarId);
	const conflicts = [];
	const conflict = (reason, declared, against, message) => {
		conflicts.push({
			eventId: event.id ?? "",
			eventTitle: event.title,
			reason,
			declared,
			actual: against,
			message
		});
	};
	if (event.duration !== void 0 && event.duration !== actual) conflict("duration-mismatch", event.duration, actual, `"${event.title}" declares ${event.duration}m of duration but spans ${actual}m of working time`);
	const available = event.duration ?? actual;
	if (event.effort !== void 0 && event.effort > available) conflict("effort-exceeds-duration", event.effort, available, `"${event.title}" declares ${event.effort}m of effort but only ${available}m of duration`);
	return conflicts;
}

//#endregion
export { checkDuration, resolveWorkingLayers, workingMinutesBetween };
//# sourceMappingURL=checkDuration.js.map