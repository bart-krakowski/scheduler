import { toPlainDateString, toPlainDateTimeString } from "../../date/parse/parse.js";
import { MINUTES_IN_DAY, formatMinutesToTime } from "../../workingTime/minutes.js";
import { describeUnavailability, toUnavailabilityConflict } from "../../validation/availability/conflicts.js";
import { calculateResizedEvent, getSegmentInfo } from "../getResizeProps.js";
import { ResizeController } from "../resizeController.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/calendar/features/resize.ts
function eventResizeFeature() {
	const resourceIdsOf = (event) => (event.resources ?? []).map((r) => typeof r === "string" ? r : r.id);
	const epochMs = (host, value) => Temporal.PlainDateTime.from(value).toZonedDateTime(host.getOptions().timeZone).epochMilliseconds;
	return {
		name: "resize",
		requires: ["recurrence"],
		api: (host, _module, peers) => {
			const readUnavailableMinutes = (date, options) => peers.availability?.getUnavailableMinuteRanges(date, options) ?? [];
			const readUnavailabilityDetails = (date, startMinutes, endMinutes, options) => peers.availability?.getUnavailabilityDetails(date, startMinutes, endMinutes, options) ?? [];
			const readDaySpanConflicts = (date, startMinutes, endMinutes, eventId, resourceIds, event) => peers.availability?.getDaySpanConflicts({
				date,
				startMinutes,
				endMinutes,
				eventId,
				resourceIds,
				event
			}) ?? [];
			const readAvailabilityConflict = (event, newStart, newEnd) => peers.availability?.checkEventAvailability(event, newStart, newEnd) ?? null;
			const validateResize = (options) => {
				const { eventId, originalStart, originalEnd, edge, totalDeltaMinutes, targetDayDate, originalDayDate, constraints } = options;
				const occurrenceStart = options.occurrenceStart != null ? toPlainDateTimeString(options.occurrenceStart) : void 0;
				const event = peers.recurrence.resolveOccurrence(eventId, occurrenceStart, originalStart);
				const resourceIds = event ? resourceIdsOf(event) : void 0;
				const unavailableRanges = readUnavailableMinutes(targetDayDate, { resourceIds });
				const originalStartDate = originalStart.split("T")[0] ?? "";
				const originalEndDate = originalEnd.split("T")[0] ?? "";
				const origStartHourMins = ((originalStart.charCodeAt(11) - 48) * 10 + (originalStart.charCodeAt(12) - 48)) * 60 + (originalStart.charCodeAt(14) - 48) * 10 + (originalStart.charCodeAt(15) - 48);
				const origEndHourMins = ((originalEnd.charCodeAt(11) - 48) * 10 + (originalEnd.charCodeAt(12) - 48)) * 60 + (originalEnd.charCodeAt(14) - 48) * 10 + (originalEnd.charCodeAt(15) - 48);
				const effectiveEdge = edge === "left" ? "top" : edge === "right" ? "bottom" : edge;
				let shouldBlockResize = false;
				let blockReason = "blocked";
				let blockMessage = "Resize blocked";
				const conflicts = [];
				const snapToMinutes = constraints?.snapToMinutes ?? 1;
				const snapMins = (minutes) => {
					if (snapToMinutes <= 1) return minutes;
					return Math.round(minutes / snapToMinutes) * snapToMinutes;
				};
				if (effectiveEdge === "top" && targetDayDate < originalStartDate) {
					const snappedTargetStartMinutes = snapMins(((origStartHourMins + totalDeltaMinutes) % MINUTES_IN_DAY + MINUTES_IN_DAY) % MINUTES_IN_DAY);
					const currentStartMinutes = origStartHourMins;
					if (resourceIds?.length) {
						const unavailabilityDetails = readUnavailabilityDetails(targetDayDate, snappedTargetStartMinutes, MINUTES_IN_DAY, { resourceIds });
						if (unavailabilityDetails.length > 0) {
							shouldBlockResize = true;
							blockReason = "unavailable-time";
							blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedTargetStartMinutes)} conflicts with ${describeUnavailability(unavailabilityDetails)}`;
							conflicts.push(toUnavailabilityConflict({
								date: targetDayDate,
								startMinutes: snappedTargetStartMinutes,
								endMinutes: MINUTES_IN_DAY,
								details: unavailabilityDetails
							}));
						}
					}
					if (!shouldBlockResize && resourceIds?.length) {
						const sourceUnavailabilityDetails = readUnavailabilityDetails(originalStartDate, 0, currentStartMinutes, { resourceIds });
						if (sourceUnavailabilityDetails.length > 0) {
							shouldBlockResize = true;
							blockReason = "unavailable-time";
							blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalStartDate} - ${describeUnavailability(sourceUnavailabilityDetails)}`;
							conflicts.push(toUnavailabilityConflict({
								date: originalStartDate,
								startMinutes: 0,
								endMinutes: currentStartMinutes,
								details: sourceUnavailabilityDetails
							}));
						}
					}
				} else if (effectiveEdge === "bottom" && targetDayDate > originalEndDate) {
					const snappedTargetEndMinutes = snapMins(((origEndHourMins + totalDeltaMinutes) % MINUTES_IN_DAY + MINUTES_IN_DAY) % MINUTES_IN_DAY);
					const currentEndMinutes = origEndHourMins;
					if (resourceIds?.length) {
						const unavailabilityDetails = readUnavailabilityDetails(targetDayDate, 0, snappedTargetEndMinutes, { resourceIds });
						if (unavailabilityDetails.length > 0) {
							shouldBlockResize = true;
							blockReason = "unavailable-time";
							blockMessage = `Unavailable: Event ending at ${formatMinutesToTime(snappedTargetEndMinutes)} conflicts with ${describeUnavailability(unavailabilityDetails)}`;
							conflicts.push(toUnavailabilityConflict({
								date: targetDayDate,
								startMinutes: 0,
								endMinutes: snappedTargetEndMinutes,
								details: unavailabilityDetails
							}));
						}
					}
					if (!shouldBlockResize && resourceIds?.length) {
						const sourceUnavailabilityDetails = readUnavailabilityDetails(originalEndDate, currentEndMinutes, MINUTES_IN_DAY, { resourceIds });
						if (sourceUnavailabilityDetails.length > 0) {
							shouldBlockResize = true;
							blockReason = "unavailable-time";
							blockMessage = `Cannot resize: Would need to pass through unavailable time on ${originalEndDate} - ${describeUnavailability(sourceUnavailabilityDetails)}`;
							conflicts.push(toUnavailabilityConflict({
								date: originalEndDate,
								startMinutes: currentEndMinutes,
								endMinutes: MINUTES_IN_DAY,
								details: sourceUnavailabilityDetails
							}));
						}
					}
				}
				if (!shouldBlockResize && targetDayDate === originalStartDate && targetDayDate === originalEndDate) {
					const rawStartMinutes = origStartHourMins + (effectiveEdge === "top" ? totalDeltaMinutes : 0);
					const rawEndMinutes = origEndHourMins + (effectiveEdge === "bottom" ? totalDeltaMinutes : 0);
					const snappedStartMinutes = snapMins((rawStartMinutes % MINUTES_IN_DAY + MINUTES_IN_DAY) % MINUTES_IN_DAY);
					const snappedEndMinutes = snapMins((rawEndMinutes % MINUTES_IN_DAY + MINUTES_IN_DAY) % MINUTES_IN_DAY);
					if (resourceIds?.length) {
						const unavailabilityDetails = readUnavailabilityDetails(targetDayDate, snappedStartMinutes, snappedEndMinutes, { resourceIds });
						if (unavailabilityDetails.length > 0) {
							shouldBlockResize = true;
							blockReason = "unavailable-time";
							blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${describeUnavailability(unavailabilityDetails)}`;
							conflicts.push(toUnavailabilityConflict({
								date: targetDayDate,
								startMinutes: snappedStartMinutes,
								endMinutes: snappedEndMinutes,
								details: unavailabilityDetails
							}));
						}
					}
					if (!shouldBlockResize && resourceIds?.length) {
						const capacityConflicts = readDaySpanConflicts(targetDayDate, snappedStartMinutes, snappedEndMinutes, eventId, resourceIds, event).filter((c) => c.resourceDetails.some((d) => d.reason === "capacity"));
						if (capacityConflicts.length > 0) {
							shouldBlockResize = true;
							blockReason = "unavailable-time";
							const detailsText = describeUnavailability(capacityConflicts[0].resourceDetails);
							blockMessage = `Unavailable: Event at ${formatMinutesToTime(snappedStartMinutes)}-${formatMinutesToTime(snappedEndMinutes)} conflicts with ${detailsText}`;
							conflicts.push(...capacityConflicts);
						}
					}
				}
				if (!shouldBlockResize && resourceIds?.length) {
					const originalStartMs = new Date(originalStart).getTime();
					const originalEndMs = new Date(originalEnd).getTime();
					const snapMs = snapToMinutes * 6e4;
					const snappedDeltaMs = Math.round(totalDeltaMinutes * 6e4 / snapMs) * snapMs;
					let checkFromMs = null;
					let checkToMs = null;
					if (effectiveEdge === "bottom") {
						const newEndMs = originalEndMs + snappedDeltaMs;
						if (newEndMs > originalEndMs) {
							checkFromMs = originalEndMs;
							checkToMs = newEndMs;
						}
					} else {
						const newStartMs = originalStartMs + snappedDeltaMs;
						if (newStartMs < originalStartMs) {
							checkFromMs = newStartMs;
							checkToMs = originalStartMs;
						}
					}
					if (checkFromMs !== null && checkToMs !== null) {
						const dayMs = 864e5;
						const cursor = new Date(checkFromMs);
						cursor.setHours(0, 0, 0, 0);
						while (cursor.getTime() < checkToMs && !shouldBlockResize) {
							const dayStr = toPlainDateString(cursor);
							const dayStartMs = cursor.getTime();
							const dayEndMs = dayStartMs + dayMs;
							const overlapStartMs = Math.max(checkFromMs, dayStartMs);
							const overlapEndMs = Math.min(checkToMs, dayEndMs);
							if (overlapStartMs < overlapEndMs) {
								const overlapStartMins = Math.floor((overlapStartMs - dayStartMs) / 6e4);
								const overlapEndMins = Math.ceil((overlapEndMs - dayStartMs) / 6e4);
								const dayConflicts = readDaySpanConflicts(dayStr, overlapStartMins, overlapEndMins, eventId, resourceIds, event);
								if (dayConflicts.length > 0) {
									shouldBlockResize = true;
									blockReason = "unavailable-time";
									const detailsText = describeUnavailability(dayConflicts[0].resourceDetails);
									blockMessage = `Unavailable: ${dayStr} ${formatMinutesToTime(overlapStartMins)}–${formatMinutesToTime(overlapEndMins)} conflicts with ${detailsText}`;
									conflicts.push(...dayConflicts);
								}
							}
							cursor.setTime(cursor.getTime() + dayMs);
						}
					}
				}
				const snapMs = (constraints?.snapToMinutes ?? 1) * 6e4;
				const snappedDeltaMs = Math.round(totalDeltaMinutes * 6e4 / snapMs) * snapMs;
				if (!shouldBlockResize && effectiveEdge === "top") {
					const resized = host.getEvent(eventId);
					if (resized?.dependsOn?.length) {
						const proposedStartMs = epochMs(host, originalStart) + snappedDeltaMs;
						const proposedEndMs = epochMs(host, originalEnd);
						const violated = peers.dependency?.findViolatedDependency(resized, proposedStartMs, proposedEndMs);
						if (violated) {
							shouldBlockResize = true;
							blockReason = "blocked";
							blockMessage = `"${resized.title}" violates ${violated.dependency.type} dependency on "${violated.predecessor.title}"`;
						}
					}
				}
				if (!shouldBlockResize && effectiveEdge === "bottom" && snappedDeltaMs > 0) {
					const affected = peers.dependency?.getAffectedByDelta(eventId, snappedDeltaMs) ?? [];
					for (const { event: affectedEvent, newStart, newEnd } of affected) {
						if (readAvailabilityConflict(affectedEvent, toPlainDateTimeString(affectedEvent.start), toPlainDateTimeString(affectedEvent.end))) continue;
						const conflict = readAvailabilityConflict(affectedEvent, newStart, newEnd);
						if (conflict) {
							shouldBlockResize = true;
							blockReason = "unavailable-time";
							blockMessage = `Blocked: "${affectedEvent.title}" would be pushed to unavailable time`;
							conflicts.push(conflict);
							break;
						}
					}
				}
				if (!shouldBlockResize && resourceIds?.length && originalStartDate === originalEndDate) {
					const selfEvent = event;
					if (selfEvent) {
						const proposedNewStart = effectiveEdge === "top" ? Temporal.PlainDateTime.from(originalStart).add({ milliseconds: snappedDeltaMs }).toString({ smallestUnit: "second" }) : originalStart;
						const proposedNewEnd = effectiveEdge === "bottom" ? Temporal.PlainDateTime.from(originalEnd).add({ milliseconds: snappedDeltaMs }).toString({ smallestUnit: "second" }) : originalEnd;
						const spanConflict = readAvailabilityConflict(selfEvent, proposedNewStart, proposedNewEnd);
						if (spanConflict) {
							shouldBlockResize = true;
							blockReason = "unavailable-time";
							blockMessage = spanConflict.description;
							if (!conflicts.some((c) => c.date === spanConflict.date && c.conflictRange.start === spanConflict.conflictRange.start && c.conflictRange.end === spanConflict.conflictRange.end)) conflicts.push(spanConflict);
						}
					}
				}
				const result = calculateResizedEvent({
					originalStart,
					originalEnd,
					edge,
					deltaMinutes: shouldBlockResize ? 0 : totalDeltaMinutes,
					timeZone: host.getOptions().timeZone,
					constraints: {
						...constraints,
						unavailableRanges: shouldBlockResize ? [] : unavailableRanges
					}
				});
				return {
					blocked: shouldBlockResize,
					error: shouldBlockResize ? {
						reason: blockReason,
						message: blockMessage,
						conflicts
					} : void 0,
					result,
					targetDayDate: shouldBlockResize ? originalDayDate : targetDayDate
				};
			};
			return {
				createResizeController: (options = {}) => new ResizeController({
					...host,
					validateResize,
					editRecurringEvent: peers.recurrence.editRecurringEvent
				}, options),
				getEventSegmentInfo: (event) => getSegmentInfo({
					start: toPlainDateTimeString(event.start),
					end: toPlainDateTimeString(event.end),
					...event._originalStart != null ? { _originalStart: event._originalStart } : {},
					...event._originalEnd != null ? { _originalEnd: event._originalEnd } : {}
				}),
				validateResize
			};
		}
	};
}

//#endregion
export { eventResizeFeature };
//# sourceMappingURL=resize.js.map