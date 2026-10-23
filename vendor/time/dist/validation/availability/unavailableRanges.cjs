const require_minutes = require('../../workingTime/minutes.cjs');
const require_time = require('./time.cjs');

//#region src/validation/availability/unavailableRanges.ts
function mergeUnavailableMinuteRanges(resources, date, workingTime, resourceIds, eventCalendarId) {
	if (!resources || resources.length === 0) return null;
	const selected = resourceIds ? resources.filter((resource) => resourceIds.includes(resource.id)) : resources;
	if (selected.length === 0) return null;
	const available = [];
	for (const resource of selected) available.push(...require_time.resourceDayWorkingTime(resource, date, workingTime, eventCalendarId).working);
	if (available.length === 0) return [{
		startMinutes: 0,
		endMinutes: require_minutes.MINUTES_IN_DAY
	}];
	return require_minutes.invertMinuteRanges(require_minutes.mergeMinuteRanges(available));
}

//#endregion
exports.mergeUnavailableMinuteRanges = mergeUnavailableMinuteRanges;
//# sourceMappingURL=unavailableRanges.cjs.map