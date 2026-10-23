import { MINUTES_IN_DAY, formatMinutesToTime, invertMinuteRanges, mergeMinuteRanges, parseHmToMinutes } from "../../workingTime/minutes.js";
import { hasAnyWorkingCalendar, resolveLayeredDayMinutes } from "../../workingTime/resolve.js";

//#region src/validation/availability/time.ts
function effectiveCalendarId(target, config) {
	return target.calendarId ?? config.defaultCalendarId;
}
function resourceDayWorkingTime(resource, date, config, eventCalendarId) {
	const layers = [effectiveCalendarId(resource, config), eventCalendarId];
	const working = resolveLayeredDayMinutes(layers, date, config.calendars);
	return {
		working,
		nonWorking: invertMinuteRanges(working),
		configured: hasAnyWorkingCalendar(layers, config.calendars)
	};
}
function applyMultiResourcePolicy(details, resourceCount, config) {
	if (config.multiResource !== "union") return details;
	return details.length >= resourceCount ? details : [];
}

//#endregion
export { MINUTES_IN_DAY, applyMultiResourcePolicy, effectiveCalendarId, formatMinutesToTime, invertMinuteRanges, mergeMinuteRanges, resourceDayWorkingTime };
//# sourceMappingURL=time.js.map