const require_minutes = require('../../workingTime/minutes.cjs');
const require_time = require('./time.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/validation/availability/checkAvailability.ts
function getUnavailabilityDetails(resources, date, startMinutes, endMinutes, workingTime, eventCalendarId) {
	if (resources.length === 0) return [];
	const details = [];
	for (const resource of resources) {
		const { working: availableSlots, configured } = require_time.resourceDayWorkingTime(resource, date, workingTime, eventCalendarId);
		if (!configured) {
			details.push({
				resourceId: resource.id,
				resourceLabel: resource.label,
				reason: "no-calendar",
				description: `${resource.label}: No working calendar configured`
			});
			continue;
		}
		if (availableSlots.length === 0) {
			details.push({
				resourceId: resource.id,
				resourceLabel: resource.label,
				reason: "outside-hours",
				description: `${resource.label}: Not available on this day`
			});
			continue;
		}
		let isWithinAvailability = false;
		for (const slot of availableSlots) if (startMinutes >= slot.startMinutes && endMinutes <= slot.endMinutes) {
			isWithinAvailability = true;
			break;
		}
		if (!isWithinAvailability) {
			let availabilityWindow = "";
			for (let i = 0; i < availableSlots.length; i++) {
				const r = availableSlots[i];
				if (i > 0) availabilityWindow += ", ";
				availabilityWindow += `${require_minutes.formatMinutesToTime(r.startMinutes)}-${require_minutes.formatMinutesToTime(r.endMinutes)}`;
			}
			details.push({
				resourceId: resource.id,
				resourceLabel: resource.label,
				reason: "outside-hours",
				description: `${resource.label}: Available ${availabilityWindow}, but event is ${require_minutes.formatMinutesToTime(startMinutes)}-${require_minutes.formatMinutesToTime(endMinutes)}`
			});
		}
	}
	return require_time.applyMultiResourcePolicy(details, resources.length, workingTime);
}
function checkAvailability(input) {
	const { event, resources, otherEvents = [] } = input;
	if (resources.length === 0) return [];
	const resourceIds = resources.map((r) => r.id);
	const startDt = _js_temporal_polyfill.Temporal.PlainDateTime.from(event.start);
	const endDt = _js_temporal_polyfill.Temporal.PlainDateTime.from(event.end);
	const startDate = startDt.toPlainDate();
	const endDate = endDt.toPlainDate();
	let cursorDate = startDate;
	const eventConsumptionSum = (input.consumption ?? [1]).reduce((a, b) => a + b, 0);
	while (_js_temporal_polyfill.Temporal.PlainDate.compare(cursorDate, endDate) <= 0) {
		const dayStr = cursorDate.toString({ calendarName: "never" });
		const isSameAsStart = _js_temporal_polyfill.Temporal.PlainDate.compare(cursorDate, startDate) === 0;
		const isSameAsEnd = _js_temporal_polyfill.Temporal.PlainDate.compare(cursorDate, endDate) === 0;
		const overlapStartMins = isSameAsStart ? startDt.hour * 60 + startDt.minute : 0;
		let overlapEndMins;
		if (isSameAsEnd) {
			const endMins = endDt.hour * 60 + endDt.minute;
			overlapEndMins = endMins === 0 && !isSameAsStart ? 0 : endMins || 1440;
		} else overlapEndMins = require_minutes.MINUTES_IN_DAY;
		if (overlapStartMins < overlapEndMins) {
			const details = getUnavailabilityDetails(resources, dayStr, overlapStartMins, overlapEndMins, input.workingTime, event.calendarId);
			if (details.length > 0) return [{
				date: dayStr,
				conflictRange: {
					start: require_minutes.formatMinutesToTime(overlapStartMins),
					end: require_minutes.formatMinutesToTime(overlapEndMins)
				},
				resourceIds,
				resourceDetails: details.map((d) => ({
					resourceId: d.resourceId,
					resourceLabel: d.resourceLabel,
					reason: d.reason,
					description: `"${event.title}": ${d.description}`
				})),
				description: `"${event.title}" would be pushed to unavailable time: ${details.map((d) => d.description).join("; ")}`
			}];
			const eventsOnDay = otherEvents.filter((candidate) => {
				const cStart = _js_temporal_polyfill.Temporal.PlainDateTime.from(candidate.start).toPlainDate();
				const cEnd = _js_temporal_polyfill.Temporal.PlainDateTime.from(candidate.end).toPlainDate();
				return _js_temporal_polyfill.Temporal.PlainDate.compare(cursorDate, cStart) >= 0 && _js_temporal_polyfill.Temporal.PlainDate.compare(cursorDate, cEnd) <= 0;
			});
			for (const resource of resources) {
				if (!resource.capacity || resource.capacity.length === 0) continue;
				const capacitySum = resource.capacity.reduce((a, b) => a + b, 0);
				if (capacitySum <= 0) continue;
				const overlappingEvents = eventsOnDay.filter((e) => {
					const masterId = e.masterId ?? e.id;
					if (e.id === event.id || masterId === event.id) return false;
					if (!e.resourceIds.includes(resource.id)) return false;
					const eStartDt = _js_temporal_polyfill.Temporal.PlainDateTime.from(e.start);
					const eEndDt = _js_temporal_polyfill.Temporal.PlainDateTime.from(e.end);
					const eStartDate = eStartDt.toPlainDate();
					const eEndDate = eEndDt.toPlainDate();
					const cursorIsStart = _js_temporal_polyfill.Temporal.PlainDate.compare(cursorDate, eStartDate) === 0;
					const cursorIsEnd = _js_temporal_polyfill.Temporal.PlainDate.compare(cursorDate, eEndDate) === 0;
					const cursorAfterStart = _js_temporal_polyfill.Temporal.PlainDate.compare(cursorDate, eStartDate) >= 0;
					const cursorBeforeEnd = _js_temporal_polyfill.Temporal.PlainDate.compare(cursorDate, eEndDate) <= 0;
					if (!cursorAfterStart || !cursorBeforeEnd) return false;
					const eStartMins = cursorIsStart ? eStartDt.hour * 60 + eStartDt.minute : 0;
					let eEndMins;
					if (cursorIsEnd) {
						const m = eEndDt.hour * 60 + eEndDt.minute;
						eEndMins = m === 0 && !cursorIsStart ? 0 : m || 1440;
					} else eEndMins = require_minutes.MINUTES_IN_DAY;
					return overlapStartMins < eEndMins && overlapEndMins > eStartMins;
				});
				const seen = /* @__PURE__ */ new Set();
				let usedByOthers = 0;
				for (const oe of overlappingEvents) {
					if (seen.has(oe.id)) continue;
					seen.add(oe.id);
					const c = oe.consumption ?? [1];
					usedByOthers += c.reduce((a, b) => a + b, 0);
				}
				const totalUsage = usedByOthers + eventConsumptionSum;
				if (totalUsage > capacitySum) return [{
					date: dayStr,
					conflictRange: {
						start: require_minutes.formatMinutesToTime(overlapStartMins),
						end: require_minutes.formatMinutesToTime(overlapEndMins)
					},
					resourceIds: [resource.id],
					resourceDetails: [{
						resourceId: resource.id,
						resourceLabel: resource.label,
						reason: "capacity",
						description: `"${event.title}": ${resource.label} capacity exceeded (${totalUsage}/${capacitySum} units used)`,
						capacityInfo: {
							max: capacitySum,
							used: totalUsage,
							remaining: Math.max(0, capacitySum - usedByOthers)
						}
					}],
					description: `"${event.title}" exceeds ${resource.label} capacity (${totalUsage}/${capacitySum})`
				}];
			}
		}
		cursorDate = cursorDate.add({ days: 1 });
	}
	return [];
}

//#endregion
exports.checkAvailability = checkAvailability;
exports.getUnavailabilityDetails = getUnavailabilityDetails;
//# sourceMappingURL=checkAvailability.cjs.map