import { formatMinutesToTime } from "../../workingTime/minutes.js";
import { resourceDayWorkingTime } from "./time.js";
import { getUnavailabilityDetails } from "./checkAvailability.js";
import { mergeUnavailableMinuteRanges } from "./unavailableRanges.js";
import { toUnavailabilityConflict } from "./conflicts.js";

//#region src/validation/availability/checkDaySpan.ts
const overlaps = (a, b) => a.startMinutes < b.endMinutes && a.endMinutes > b.startMinutes;
const sum = (values) => values.reduce((total, value) => total + value, 0);
function checkDaySpan(input) {
	const { date, startMinutes, endMinutes, resources, workingTime } = input;
	if (resources.length === 0) return [];
	const span = {
		startMinutes,
		endMinutes
	};
	const conflicts = [];
	const details = getUnavailabilityDetails(resources, date, startMinutes, endMinutes, workingTime, input.eventCalendarId);
	const unavailable = mergeUnavailableMinuteRanges(resources, date, workingTime, void 0, input.eventCalendarId) ?? [];
	for (const range of unavailable) {
		if (!overlaps(range, span)) continue;
		const blocking = details.filter((detail) => {
			const resource = resources.find((r) => r.id === detail.resourceId);
			if (!resource) return false;
			const slots = resourceDayWorkingTime(resource, date, workingTime, input.eventCalendarId).working;
			if (slots.length === 0) return true;
			return !slots.some((slot) => overlaps(slot, range));
		});
		if (blocking.length === 0) continue;
		conflicts.push(toUnavailabilityConflict({
			date,
			startMinutes: Math.max(startMinutes, range.startMinutes),
			endMinutes: Math.min(endMinutes, range.endMinutes),
			details: blocking
		}));
	}
	const ownConsumption = sum(input.consumption ?? [1]);
	const otherEvents = input.otherEvents ?? [];
	for (const resource of resources) {
		if (!resource.capacity?.length) continue;
		const usedByOthers = otherEvents.filter((event) => event.resourceIds.includes(resource.id) && overlaps(event, span)).reduce((total, event) => total + sum(event.consumption ?? [1]), 0);
		const capacity = sum(resource.capacity);
		const totalUsage = usedByOthers + ownConsumption;
		if (totalUsage <= capacity) continue;
		const description = `${resource.label}: Capacity exceeded (${totalUsage}/${capacity} units used)`;
		conflicts.push({
			date,
			conflictRange: {
				start: formatMinutesToTime(startMinutes),
				end: formatMinutesToTime(endMinutes)
			},
			resourceIds: [resource.id],
			resourceDetails: [{
				resourceId: resource.id,
				resourceLabel: resource.label,
				reason: "capacity",
				description,
				capacityInfo: {
					max: capacity,
					used: totalUsage,
					remaining: 0
				}
			}],
			description
		});
	}
	return conflicts;
}

//#endregion
export { checkDaySpan };
//# sourceMappingURL=checkDaySpan.js.map