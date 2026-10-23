import { toPlainDateTimeString } from "../date/parse/parse.js";
import { layoutDaySegments, toLayoutStyle } from "../projection/layout.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/calendar/getEventProps.ts
const toZonedDateTime = (dateInput, timeZone) => Temporal.PlainDateTime.from(toPlainDateTimeString(dateInput)).toZonedDateTime(timeZone);
const hasTimeOverlap = (aStart, aEnd, bStart, bEnd) => {
	const compare = Temporal.ZonedDateTime.compare;
	return compare(aStart, bEnd) < 0 && compare(aEnd, bStart) > 0;
};
const getFullEventTimes = (segments, timeZone, fallback) => {
	if (segments.length <= 1) return {
		start: toPlainDateTimeString(fallback.start),
		end: toPlainDateTimeString(fallback.end)
	};
	const sorted = [...segments].sort((a, b) => Temporal.ZonedDateTime.compare(toZonedDateTime(a.start, timeZone), toZonedDateTime(b.start, timeZone)));
	return {
		start: toPlainDateTimeString(sorted[0]?.start ?? fallback.start),
		end: toPlainDateTimeString(sorted[sorted.length - 1]?.end ?? fallback.end)
	};
};
const dayKeyOf = (value) => toPlainDateTimeString(value).slice(0, 10);
const sameSegment = (a, b) => a.id === b.id && toPlainDateTimeString(a.start) === toPlainDateTimeString(b.start);
const getEventProps = (eventMap, event, state, options) => {
	const { timeZone } = options;
	const allEvents = [...eventMap.values()].flat();
	const segmentStart = toZonedDateTime(event.start, timeZone);
	const segmentEnd = toZonedDateTime(event.end, timeZone);
	const segments = allEvents.filter((e) => e.id === event.id);
	const isSplitEvent = segments.length > 1;
	const { start, end } = getFullEventTimes(segments, timeZone, event);
	const baseProps = {
		isSplitEvent,
		overlappingEvents: allEvents.filter((e) => {
			if (e.id === event.id) return false;
			const eStart = toZonedDateTime(e.start, timeZone);
			const eEnd = toZonedDateTime(e.end, timeZone);
			return hasTimeOverlap(segmentStart, segmentEnd, eStart, eEnd);
		}),
		start,
		end
	};
	if (!(state.viewMode.unit === "week" || state.viewMode.unit === "day")) return baseProps;
	const daySegments = (options.daySegments ?? eventMap.get(dayKeyOf(event.start)) ?? []).filter((e) => Boolean(e.allDay) === Boolean(event.allDay));
	const knownIndex = daySegments.findIndex((e) => sameSegment(e, event));
	const laidOut = knownIndex >= 0 ? daySegments : [...daySegments, event];
	const index = knownIndex >= 0 ? knownIndex : laidOut.length - 1;
	const layout = layoutDaySegments(laidOut, options)[index];
	return {
		...baseProps,
		layout,
		style: toLayoutStyle(layout, options.orientation)
	};
};

//#endregion
export { getEventProps };
//# sourceMappingURL=getEventProps.js.map