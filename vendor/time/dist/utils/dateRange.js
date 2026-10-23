import { Temporal } from "@js-temporal/polyfill";

//#region src/utils/dateRange.ts
function toPlainDate(input, calendar) {
	if (input instanceof Temporal.PlainDate) return input.withCalendar(calendar);
	if (input instanceof Temporal.ZonedDateTime) return input.toPlainDate().withCalendar(calendar);
	if (input instanceof Date) return Temporal.PlainDate.from({
		year: input.getFullYear(),
		month: input.getMonth() + 1,
		day: input.getDate()
	}).withCalendar(calendar);
	if (typeof input === "number") {
		const date = new Date(input);
		return Temporal.PlainDate.from({
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate()
		}).withCalendar(calendar);
	}
	return Temporal.PlainDate.from(input).withCalendar(calendar);
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
	if (start && Temporal.PlainDate.compare(date, start) < 0) return false;
	if (end && Temporal.PlainDate.compare(date, end) > 0) return false;
	return true;
}
function constrainDateToRange({ date, range }) {
	const { start, end } = range;
	if (start && Temporal.PlainDate.compare(date, start) < 0) return start;
	if (end && Temporal.PlainDate.compare(date, end) > 0) return end;
	return date;
}

//#endregion
export { constrainDateToRange, isDateInRange, parseDateRange };
//# sourceMappingURL=dateRange.js.map