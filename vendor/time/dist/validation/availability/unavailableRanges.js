import { MINUTES_IN_DAY, invertMinuteRanges, mergeMinuteRanges } from "../../workingTime/minutes.js";
import { resourceDayWorkingTime } from "./time.js";

//#region src/validation/availability/unavailableRanges.ts
function mergeUnavailableMinuteRanges(resources, date, workingTime, resourceIds, eventCalendarId) {
	if (!resources || resources.length === 0) return null;
	const selected = resourceIds ? resources.filter((resource) => resourceIds.includes(resource.id)) : resources;
	if (selected.length === 0) return null;
	const available = [];
	for (const resource of selected) available.push(...resourceDayWorkingTime(resource, date, workingTime, eventCalendarId).working);
	if (available.length === 0) return [{
		startMinutes: 0,
		endMinutes: MINUTES_IN_DAY
	}];
	return invertMinuteRanges(mergeMinuteRanges(available));
}

//#endregion
export { mergeUnavailableMinuteRanges };
//# sourceMappingURL=unavailableRanges.js.map