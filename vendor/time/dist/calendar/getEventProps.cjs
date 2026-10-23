const require_parse = require('../date/parse/parse.cjs');
const require_layout = require('../projection/layout.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/calendar/getEventProps.ts
const toZonedDateTime = (dateInput, timeZone) => _js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(dateInput)).toZonedDateTime(timeZone);
const hasTimeOverlap = (aStart, aEnd, bStart, bEnd) => {
	const compare = _js_temporal_polyfill.Temporal.ZonedDateTime.compare;
	return compare(aStart, bEnd) < 0 && compare(aEnd, bStart) > 0;
};
const getFullEventTimes = (segments, timeZone, fallback) => {
	if (segments.length <= 1) return {
		start: require_parse.toPlainDateTimeString(fallback.start),
		end: require_parse.toPlainDateTimeString(fallback.end)
	};
	const sorted = [...segments].sort((a, b) => _js_temporal_polyfill.Temporal.ZonedDateTime.compare(toZonedDateTime(a.start, timeZone), toZonedDateTime(b.start, timeZone)));
	return {
		start: require_parse.toPlainDateTimeString(sorted[0]?.start ?? fallback.start),
		end: require_parse.toPlainDateTimeString(sorted[sorted.length - 1]?.end ?? fallback.end)
	};
};
const dayKeyOf = (value) => require_parse.toPlainDateTimeString(value).slice(0, 10);
const sameSegment = (a, b) => a.id === b.id && require_parse.toPlainDateTimeString(a.start) === require_parse.toPlainDateTimeString(b.start);
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
	const layout = require_layout.layoutDaySegments(laidOut, options)[index];
	return {
		...baseProps,
		layout,
		style: require_layout.toLayoutStyle(layout, options.orientation)
	};
};

//#endregion
exports.getEventProps = getEventProps;
//# sourceMappingURL=getEventProps.cjs.map