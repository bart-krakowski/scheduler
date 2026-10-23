import { Temporal } from "@js-temporal/polyfill";

//#region src/calendar/getResizeProps.ts
const MINUTES_IN_DAY = 1440;
const extractDateFromDateTime = (dateTime) => dateTime.split("T")[0] ?? dateTime;
const DEFAULT_MIN_DURATION_MINUTES = 15;
const DEFAULT_SNAP_TO_MINUTES = 15;
const roundToNearestInterval = (minutes, interval) => Math.round(minutes / interval) * interval;
const getMinutesFromMidnight = (zdt) => zdt.hour * 60 + zdt.minute;
const setMinutesFromMidnight = (zdt, minutes) => {
	const clampedMinutes = Math.max(0, Math.min(minutes, 1439));
	const hours = Math.floor(clampedMinutes / 60);
	const mins = clampedMinutes % 60;
	return zdt.with({
		hour: hours,
		minute: mins,
		second: 0,
		millisecond: 0
	});
};
function calculateResizedEvent(options) {
	const { originalStart, originalEnd, edge, deltaMinutes, timeZone, constraints = {} } = options;
	const { minDurationMinutes = DEFAULT_MIN_DURATION_MINUTES, snapToMinutes = DEFAULT_SNAP_TO_MINUTES, unavailableRanges = [] } = constraints;
	const startZdt = Temporal.PlainDateTime.from(originalStart).toZonedDateTime(timeZone);
	const endZdt = Temporal.PlainDateTime.from(originalEnd).toZonedDateTime(timeZone);
	const snappedDelta = roundToNearestInterval(deltaMinutes, snapToMinutes);
	let newStartZdt = startZdt;
	let newEndZdt = endZdt;
	const isEntireDayUnavailable = unavailableRanges.some((range) => range.startMinutes === 0 && range.endMinutes >= MINUTES_IN_DAY);
	if ((edge === "left" ? "top" : edge === "right" ? "bottom" : edge) === "top") {
		newStartZdt = startZdt.add({ minutes: snappedDelta });
		const maxStartZdt = endZdt.subtract({ minutes: minDurationMinutes });
		if (Temporal.ZonedDateTime.compare(newStartZdt, maxStartZdt) > 0) newStartZdt = maxStartZdt;
		if (isEntireDayUnavailable) {
			const originalStartMinutes = getMinutesFromMidnight(startZdt);
			newStartZdt = setMinutesFromMidnight(newStartZdt, originalStartMinutes);
		} else {
			let newStartMinutes = getMinutesFromMidnight(newStartZdt);
			for (const range of unavailableRanges) if (newStartMinutes >= range.startMinutes && newStartMinutes < range.endMinutes) {
				if (range.endMinutes < MINUTES_IN_DAY) {
					newStartZdt = setMinutesFromMidnight(newStartZdt, range.endMinutes);
					newStartMinutes = range.endMinutes;
				} else if (range.startMinutes > 0) {
					const validTime = range.startMinutes - snapToMinutes;
					if (validTime >= 0) {
						newStartZdt = setMinutesFromMidnight(newStartZdt, validTime);
						newStartMinutes = validTime;
					}
				}
			}
		}
	} else {
		newEndZdt = endZdt.add({ minutes: snappedDelta });
		const minEndZdt = startZdt.add({ minutes: minDurationMinutes });
		if (Temporal.ZonedDateTime.compare(newEndZdt, minEndZdt) < 0) newEndZdt = minEndZdt;
		if (isEntireDayUnavailable) {
			const originalEndMinutes = getMinutesFromMidnight(endZdt);
			newEndZdt = setMinutesFromMidnight(newEndZdt, originalEndMinutes);
		} else {
			let newEndMinutes = getMinutesFromMidnight(newEndZdt);
			for (const range of unavailableRanges) if (newEndMinutes > range.startMinutes && newEndMinutes <= range.endMinutes) {
				if (range.startMinutes > 0) {
					newEndZdt = setMinutesFromMidnight(newEndZdt, range.startMinutes);
					newEndMinutes = range.startMinutes;
				} else if (range.endMinutes < MINUTES_IN_DAY) {
					const validTime = range.endMinutes + snapToMinutes;
					if (validTime <= MINUTES_IN_DAY) {
						newEndZdt = setMinutesFromMidnight(newEndZdt, validTime);
						newEndMinutes = validTime;
					}
				}
			}
		}
	}
	const durationMs = newEndZdt.epochMilliseconds - newStartZdt.epochMilliseconds;
	const durationMinutes = Math.floor(durationMs / 6e4);
	return {
		start: newStartZdt.toPlainDateTime().toString(),
		end: newEndZdt.toPlainDateTime().toString(),
		durationMinutes
	};
}
function calculateDeltaMinutesFromPixels(deltaPixels, containerHeight, minutesInDay = 1440) {
	return deltaPixels / containerHeight * minutesInDay;
}
function calculateDeltaMinutesFromPixelsHorizontal(deltaPixels, containerWidth, totalMinutesInView) {
	return deltaPixels / containerWidth * totalMinutesInView;
}
function getResizeHandleStyle(edge) {
	const baseStyle = {
		position: "absolute",
		left: 0,
		right: 0,
		height: "8px",
		cursor: "ns-resize",
		zIndex: 10
	};
	if (edge === "top") return {
		...baseStyle,
		top: 0
	};
	return {
		...baseStyle,
		bottom: 0
	};
}
function getSegmentInfo(event) {
	const originalStart = event._originalStart ?? event.start;
	const originalEnd = event._originalEnd ?? event.end;
	const originalStartDate = extractDateFromDateTime(originalStart);
	const originalEndDate = extractDateFromDateTime(originalEnd);
	const segmentStart = event.start;
	const segmentEnd = event.end;
	const segmentStartDate = extractDateFromDateTime(segmentStart);
	const segmentEndDate = extractDateFromDateTime(segmentEnd);
	const isSplitEvent = event._originalStart !== void 0 || event._originalEnd !== void 0;
	return {
		isFirstSegment: originalStartDate === segmentStartDate,
		isLastSegment: originalEndDate === segmentStartDate || originalEndDate === segmentEndDate,
		isSplitEvent,
		originalStart,
		originalEnd,
		segmentStart,
		segmentEnd
	};
}
function calculateSegmentResizePreview(options) {
	const { dayDate, originalStart, originalEnd, previewStart, previewEnd } = options;
	const previewStartDate = extractDateFromDateTime(previewStart);
	const previewEndDate = extractDateFromDateTime(previewEnd);
	const previewAffectsThisDay = dayDate >= previewStartDate && dayDate <= previewEndDate;
	const hasChanged = previewStart !== originalStart || previewEnd !== originalEnd;
	if (!previewAffectsThisDay) return {
		shouldHide: true,
		previewStyle: null,
		hasChanged
	};
	if (!hasChanged) return {
		shouldHide: false,
		previewStyle: null,
		hasChanged: false
	};
	const isPreviewFirstDay = previewStartDate === dayDate;
	const isPreviewLastDay = previewEndDate === dayDate;
	let effectiveStart;
	let effectiveEnd;
	if (isPreviewFirstDay && isPreviewLastDay) {
		effectiveStart = previewStart;
		effectiveEnd = previewEnd;
	} else if (isPreviewFirstDay) {
		effectiveStart = previewStart;
		effectiveEnd = `${dayDate}T23:59:59`;
	} else if (isPreviewLastDay) {
		effectiveStart = `${dayDate}T00:00:00`;
		effectiveEnd = previewEnd;
	} else {
		effectiveStart = `${dayDate}T00:00:00`;
		effectiveEnd = `${dayDate}T23:59:59`;
	}
	const startDate = new Date(effectiveStart);
	const endDate = new Date(effectiveEnd);
	const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
	const endMinutes = endDate.getHours() * 60 + endDate.getMinutes() || MINUTES_IN_DAY;
	const topPercent = startMinutes / MINUTES_IN_DAY * 100;
	const heightPercent = (endMinutes - startMinutes) / MINUTES_IN_DAY * 100;
	if (heightPercent <= 0) return {
		shouldHide: true,
		previewStyle: null,
		hasChanged
	};
	return {
		shouldHide: false,
		previewStyle: {
			top: `${topPercent}%`,
			height: `${heightPercent}%`
		},
		hasChanged
	};
}
function calculateGhostPreviewStyle(options) {
	const { dayDate, previewStart, previewEnd } = options;
	const previewStartDate = extractDateFromDateTime(previewStart);
	const previewEndDate = extractDateFromDateTime(previewEnd);
	if (!(dayDate >= previewStartDate && dayDate <= previewEndDate)) return null;
	const isFirstDay = dayDate === previewStartDate;
	const isLastDay = dayDate === previewEndDate;
	let ghostTop;
	let ghostBottom;
	if (isFirstDay && isLastDay) {
		const startDate = new Date(previewStart);
		const endDate = new Date(previewEnd);
		ghostTop = (startDate.getHours() * 60 + startDate.getMinutes()) / MINUTES_IN_DAY * 100;
		ghostBottom = (endDate.getHours() * 60 + endDate.getMinutes()) / MINUTES_IN_DAY * 100;
	} else if (isFirstDay) {
		const startDate = new Date(previewStart);
		ghostTop = (startDate.getHours() * 60 + startDate.getMinutes()) / MINUTES_IN_DAY * 100;
		ghostBottom = 100;
	} else if (isLastDay) {
		const endDate = new Date(previewEnd);
		ghostTop = 0;
		ghostBottom = (endDate.getHours() * 60 + endDate.getMinutes()) / MINUTES_IN_DAY * 100;
	} else {
		ghostTop = 0;
		ghostBottom = 100;
	}
	const ghostHeight = ghostBottom - ghostTop;
	if (ghostHeight <= 0) return null;
	return {
		top: `${ghostTop}%`,
		height: `${ghostHeight}%`
	};
}
function calculateTimelineResizePreview(options) {
	const { previewStart, previewEnd, firstDayIso, totalDays } = options;
	const startStr = previewStart;
	const endStr = previewEnd;
	const startDateStr = startStr.split("T")[0];
	const endDateStr = endStr.split("T")[0];
	const startTimeStr = startStr.split("T")[1] ?? "00:00:00";
	const endTimeStr = endStr.split("T")[1] ?? "00:00:00";
	const startTimeParts = startTimeStr.split(":").map(Number);
	const endTimeParts = endTimeStr.split(":").map(Number);
	const startDayOffset = Math.round((new Date(startDateStr).getTime() - new Date(firstDayIso).getTime()) / 864e5);
	const endDayOffset = Math.round((new Date(endDateStr).getTime() - new Date(firstDayIso).getTime()) / 864e5);
	const startHours = startDayOffset * 24 + (startTimeParts[0] ?? 0) + (startTimeParts[1] ?? 0) / 60;
	const endHours = endDayOffset * 24 + (endTimeParts[0] ?? 0) + (endTimeParts[1] ?? 0) / 60;
	const totalHours = totalDays * 24;
	const left = Math.max(0, startHours / totalHours * 100);
	const right = Math.min(100, endHours / totalHours * 100);
	const width = Math.max(0, right - left);
	return {
		left: `${left}%`,
		width: `${width}%`
	};
}
function isMultiDayEvent(start, end) {
	const startDate = new Date(start);
	const endDate = new Date(end);
	return startDate.toDateString() !== endDate.toDateString();
}
function getEventDisplayTimeRange(options) {
	const { originalStart, originalEnd, isBeingResized, previewStart, previewEnd } = options;
	const displayStart = isBeingResized && previewStart ? previewStart : originalStart;
	const displayEnd = isBeingResized && previewEnd ? previewEnd : originalEnd;
	return {
		start: displayStart,
		end: displayEnd,
		isMultiDay: isMultiDayEvent(displayStart, displayEnd)
	};
}
function formatEventTimeRange(start, end, options = {}) {
	const { locale = "en-US", alwaysShowDate = false } = options;
	const startDate = new Date(start);
	const endDate = new Date(end);
	const isMultiDay = startDate.toDateString() !== endDate.toDateString();
	const timeOptions = {
		hour: "numeric",
		minute: "2-digit"
	};
	const dateTimeOptions = {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit"
	};
	const showDate = isMultiDay || alwaysShowDate;
	const startFormatted = showDate ? startDate.toLocaleString(locale, dateTimeOptions) : startDate.toLocaleTimeString(locale, timeOptions);
	const endFormatted = showDate ? endDate.toLocaleString(locale, dateTimeOptions) : endDate.toLocaleTimeString(locale, timeOptions);
	return {
		startFormatted,
		endFormatted,
		rangeFormatted: `${startFormatted} - ${endFormatted}`,
		isMultiDay
	};
}

//#endregion
export { calculateDeltaMinutesFromPixels, calculateDeltaMinutesFromPixelsHorizontal, calculateGhostPreviewStyle, calculateResizedEvent, calculateSegmentResizePreview, calculateTimelineResizePreview, formatEventTimeRange, getEventDisplayTimeRange, getResizeHandleStyle, getSegmentInfo, isMultiDayEvent };
//# sourceMappingURL=getResizeProps.js.map