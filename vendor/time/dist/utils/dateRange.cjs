let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/utils/dateRange.ts
function toPlainDate(input, calendar) {
	if (input instanceof _js_temporal_polyfill.Temporal.PlainDate) return input.withCalendar(calendar);
	if (input instanceof _js_temporal_polyfill.Temporal.ZonedDateTime) return input.toPlainDate().withCalendar(calendar);
	if (input instanceof Date) return _js_temporal_polyfill.Temporal.PlainDate.from({
		year: input.getFullYear(),
		month: input.getMonth() + 1,
		day: input.getDate()
	}).withCalendar(calendar);
	if (typeof input === "number") {
		const date = new Date(input);
		return _js_temporal_polyfill.Temporal.PlainDate.from({
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate()
		}).withCalendar(calendar);
	}
	return _js_temporal_polyfill.Temporal.PlainDate.from(input).withCalendar(calendar);
}
function parseDateRange({ range, calendar }) {
	if (!range) return {
		start: null,
		end: null
	};
	return {
		start: range.start ? toPlainDate(range.start, calendar) : null,
		end: range.end ? toPlainDate(range.end, calendar) : null
	};
}
function isDateInRange({ date, range }) {
	const { start, end } = range;
	if (start && _js_temporal_polyfill.Temporal.PlainDate.compare(date, start) < 0) return false;
	if (end && _js_temporal_polyfill.Temporal.PlainDate.compare(date, end) > 0) return false;
	return true;
}
function constrainDateToRange({ date, range }) {
	const { start, end } = range;
	if (start && _js_temporal_polyfill.Temporal.PlainDate.compare(date, start) < 0) return start;
	if (end && _js_temporal_polyfill.Temporal.PlainDate.compare(date, end) > 0) return end;
	return date;
}

//#endregion
exports.constrainDateToRange = constrainDateToRange;
exports.isDateInRange = isDateInRange;
exports.parseDateRange = parseDateRange;
//# sourceMappingURL=dateRange.cjs.map