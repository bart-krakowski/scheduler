const require_minutes = require('./minutes.cjs');
const require_resolve = require('./resolve.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/workingTime/skew.ts
const MAX_WORKING_SKEW_DAYS = 366;
function dayOf(value) {
	return value.slice(0, 10);
}
function minutesOf(value) {
	if (value.length < 16) return 0;
	return require_minutes.parseHmToMinutes(value.slice(11, 16));
}
function stampFrom(base, totalMinutes) {
	const days = Math.floor(totalMinutes / require_minutes.MINUTES_IN_DAY);
	const minutesOfDay = totalMinutes - days * require_minutes.MINUTES_IN_DAY;
	const date = base.add({ days });
	const time = require_minutes.formatMinutesToTime(minutesOfDay);
	return `${date.toString({ calendarName: "never" })}T${time}:00`;
}
function dayWorkingMinutes(layers, day, calendars) {
	return require_minutes.mergeMinuteRanges(layers.flatMap((stack) => require_resolve.resolveLayeredDayMinutes(stack, day, calendars)));
}
function nextWorkingInstant(from, layers, calendars) {
	if (!require_resolve.hasAnyWorkingCalendar(layers.flat(), calendars)) return from;
	const fromMinutes = minutesOf(from);
	let cursor = _js_temporal_polyfill.Temporal.PlainDate.from(dayOf(from));
	for (let day = 0; day <= 366; day++) {
		const lowerBound = day === 0 ? fromMinutes : 0;
		const date = cursor.toString({ calendarName: "never" });
		for (const span of dayWorkingMinutes(layers, date, calendars)) {
			if (span.endMinutes <= lowerBound) continue;
			return stampFrom(cursor, Math.max(span.startMinutes, lowerBound));
		}
		cursor = cursor.add({ days: 1 });
	}
	return null;
}
function previousWorkingInstant(from, layers, calendars) {
	if (!require_resolve.hasAnyWorkingCalendar(layers.flat(), calendars)) return from;
	const fromMinutes = minutesOf(from);
	let cursor = _js_temporal_polyfill.Temporal.PlainDate.from(dayOf(from));
	for (let day = 0; day <= 366; day++) {
		const upperBound = day === 0 ? fromMinutes : require_minutes.MINUTES_IN_DAY;
		const spans = dayWorkingMinutes(layers, cursor.toString({ calendarName: "never" }), calendars);
		for (let i = spans.length - 1; i >= 0; i--) {
			const span = spans[i];
			if (span.startMinutes > upperBound) continue;
			return stampFrom(cursor, Math.min(span.endMinutes, upperBound));
		}
		cursor = cursor.subtract({ days: 1 });
	}
	return null;
}
function addWorkingMinutes(start, minutes, layers, calendars) {
	if (!require_resolve.hasAnyWorkingCalendar(layers.flat(), calendars)) return stampFrom(_js_temporal_polyfill.Temporal.PlainDate.from(dayOf(start)), minutesOf(start) + Math.max(0, minutes));
	if (minutes <= 0) return nextWorkingInstant(start, layers, calendars);
	const startMinutes = minutesOf(start);
	let remaining = minutes;
	let cursor = _js_temporal_polyfill.Temporal.PlainDate.from(dayOf(start));
	for (let day = 0; day <= 366; day++) {
		const lowerBound = day === 0 ? startMinutes : 0;
		const date = cursor.toString({ calendarName: "never" });
		for (const span of dayWorkingMinutes(layers, date, calendars)) {
			const from = Math.max(span.startMinutes, lowerBound);
			if (span.endMinutes <= from) continue;
			const available = span.endMinutes - from;
			if (remaining <= available) return stampFrom(cursor, from + remaining);
			remaining -= available;
		}
		cursor = cursor.add({ days: 1 });
	}
	return null;
}
function subtractWorkingMinutes(end, minutes, layers, calendars) {
	if (!require_resolve.hasAnyWorkingCalendar(layers.flat(), calendars)) return stampFrom(_js_temporal_polyfill.Temporal.PlainDate.from(dayOf(end)), minutesOf(end) - Math.max(0, minutes));
	if (minutes <= 0) return previousWorkingInstant(end, layers, calendars);
	const endMinutes = minutesOf(end);
	let remaining = minutes;
	let cursor = _js_temporal_polyfill.Temporal.PlainDate.from(dayOf(end));
	for (let day = 0; day <= 366; day++) {
		const upperBound = day === 0 ? endMinutes : require_minutes.MINUTES_IN_DAY;
		const spans = dayWorkingMinutes(layers, cursor.toString({ calendarName: "never" }), calendars);
		for (let i = spans.length - 1; i >= 0; i--) {
			const span = spans[i];
			const to = Math.min(span.endMinutes, upperBound);
			if (to <= span.startMinutes) continue;
			const available = to - span.startMinutes;
			if (remaining <= available) return stampFrom(cursor, to - remaining);
			remaining -= available;
		}
		cursor = cursor.subtract({ days: 1 });
	}
	return null;
}

//#endregion
exports.addWorkingMinutes = addWorkingMinutes;
exports.nextWorkingInstant = nextWorkingInstant;
exports.previousWorkingInstant = previousWorkingInstant;
exports.subtractWorkingMinutes = subtractWorkingMinutes;
//# sourceMappingURL=skew.cjs.map