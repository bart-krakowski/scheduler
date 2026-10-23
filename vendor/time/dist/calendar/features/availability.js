import { getUnavailabilityDetails } from "../../validation/availability/checkAvailability.js";
import { checkDaySpan } from "../../validation/availability/checkDaySpan.js";
import { toUnavailableRanges } from "../../projection/unavailability.js";
import { availabilityModule } from "../../kernel/modules/availability.js";

//#region src/calendar/features/availability.ts
function resourceAvailabilityFeature() {
	const resourceIdsOf = (event) => (event.resources ?? []).map((r) => typeof r === "string" ? r : r.id);
	const mergedMinutes = (host, peers, date, resourceIds) => {
		const allResources = host.getOptions().resources;
		if (!allResources || allResources.length === 0) return null;
		const ids = allResources.filter((r) => !resourceIds || resourceIds.includes(r.id)).map((r) => r.id);
		if (ids.length === 0) return null;
		return peers.workingTime.getNonWorkingMinutes(date, { resourceIds: ids });
	};
	const details = (host, date, startMinutes, endMinutes, resourceIds) => {
		const all = host.getOptions().resources;
		const resources = resourceIds ? all?.filter((resource) => resourceIds.includes(resource.id)) : all;
		if (!resources || resources.length === 0) return [];
		return getUnavailabilityDetails(resources, date, startMinutes, endMinutes, host.getOptions().workingTime);
	};
	const conflictOf = (module, event, newStart, newEnd, newResources, newConsumption) => {
		const [conflict] = module.evaluateAvailability({
			id: event.id,
			title: event.title,
			start: newStart,
			end: newEnd,
			resources: newResources ?? event.resources,
			consumption: newConsumption ?? event.consumption,
			calendarId: event.calendarId
		});
		return conflict ?? null;
	};
	return {
		name: "availability",
		requires: ["workingTime"],
		module: (ctx) => availabilityModule({
			resources: () => ctx.getResources(),
			workingTime: () => ctx.getWorkingTime()
		}),
		api: (host, module, peers) => ({
			getUnavailableRanges: (date, options) => {
				const merged = mergedMinutes(host, peers, date, options?.resourceIds);
				if (merged === null) return [];
				return toUnavailableRanges(merged);
			},
			getUnavailableMinuteRanges: (date, options) => {
				const merged = mergedMinutes(host, peers, date, options?.resourceIds);
				if (!merged) return [];
				return merged.map((r) => ({
					startMinutes: r.startMinutes,
					endMinutes: r.endMinutes
				}));
			},
			getUnavailabilityDetails: (date, startMinutes, endMinutes, options) => details(host, date, startMinutes, endMinutes, options?.resourceIds),
			getDaySpanConflicts: (options) => {
				const resources = (host.getOptions().resources ?? []).filter((resource) => options.resourceIds.includes(resource.id));
				const selfEvent = options.event ?? host.getEvent(options.eventId);
				return checkDaySpan({
					date: options.date,
					startMinutes: options.startMinutes,
					endMinutes: options.endMinutes,
					resources,
					workingTime: host.getOptions().workingTime,
					eventCalendarId: selfEvent?.calendarId,
					consumption: selfEvent?.consumption,
					otherEvents: host.getEventsByDate(options.date).filter((event) => event.id !== options.eventId).map((event) => {
						const start = new Date(event.start);
						const end = new Date(event.end);
						return {
							id: event.id,
							startMinutes: start.getHours() * 60 + start.getMinutes(),
							endMinutes: end.getHours() * 60 + end.getMinutes(),
							resourceIds: resourceIdsOf(event),
							consumption: event.consumption
						};
					})
				});
			},
			checkEventAvailability: (event, newStart, newEnd, newResources, newConsumption) => conflictOf(module, event, newStart, newEnd, newResources, newConsumption),
			validateEventPlacement: (event) => {
				const placeholder = {
					id: event.id ?? "__validate_placement__",
					title: event.title,
					start: event.start,
					end: event.end,
					resources: event.resources,
					consumption: event.consumption,
					calendarId: event.calendarId
				};
				const conflict = conflictOf(module, placeholder, event.start, event.end, event.resources, event.consumption);
				if (!conflict) return { blocked: false };
				return {
					blocked: true,
					message: conflict.resourceDetails.some((d) => d.reason === "capacity") ? `Cannot place "${event.title}" here — ${conflict.description}.` : `Cannot place "${event.title}" here — it falls inside an unavailable zone.`
				};
			}
		})
	};
}

//#endregion
export { resourceAvailabilityFeature };
//# sourceMappingURL=availability.js.map