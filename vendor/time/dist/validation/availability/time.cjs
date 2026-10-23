const require_minutes = require('../../workingTime/minutes.cjs');
const require_resolve = require('../../workingTime/resolve.cjs');

//#region src/validation/availability/time.ts
function effectiveCalendarId(target, config) {
	return target.calendarId ?? config.defaultCalendarId;
}
function resourceDayWorkingTime(resource, date, config, eventCalendarId) {
	const layers = [effectiveCalendarId(resource, config), eventCalendarId];
	const working = require_resolve.resolveLayeredDayMinutes(layers, date, config.calendars);
	return {
		working,
		nonWorking: require_minutes.invertMinuteRanges(working),
		configured: require_resolve.hasAnyWorkingCalendar(layers, config.calendars)
	};
}
function applyMultiResourcePolicy(details, resourceCount, config) {
	if (config.multiResource !== "union") return details;
	return details.length >= resourceCount ? details : [];
}

//#endregion
exports.MINUTES_IN_DAY = require_minutes.MINUTES_IN_DAY;
exports.applyMultiResourcePolicy = applyMultiResourcePolicy;
exports.effectiveCalendarId = effectiveCalendarId;
exports.formatMinutesToTime = require_minutes.formatMinutesToTime;
exports.invertMinuteRanges = require_minutes.invertMinuteRanges;
exports.mergeMinuteRanges = require_minutes.mergeMinuteRanges;
exports.resourceDayWorkingTime = resourceDayWorkingTime;
//# sourceMappingURL=time.cjs.map