const require_parse = require('../date/parse/parse.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/projection/splitMultiDay.ts
const DAY_START = {
	hour: 0,
	minute: 0,
	second: 0,
	millisecond: 0,
	microsecond: 0,
	nanosecond: 0
};
const DAY_END = {
	hour: 23,
	minute: 59,
	second: 59,
	millisecond: 999,
	microsecond: 0,
	nanosecond: 0
};
function splitMultiDay(event, timeZone) {
	const startDate = _js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(event.start)).toZonedDateTime(timeZone);
	const endDate = _js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(event.end)).toZonedDateTime(timeZone);
	const events = [];
	let currentDay = startDate;
	while (_js_temporal_polyfill.Temporal.ZonedDateTime.compare(currentDay, endDate) < 0) {
		const startOfDay = currentDay.with(DAY_START);
		const endOfDay = currentDay.with(DAY_END);
		const eventStart = _js_temporal_polyfill.Temporal.ZonedDateTime.compare(currentDay, startDate) === 0 ? startDate : startOfDay;
		const eventEnd = _js_temporal_polyfill.Temporal.ZonedDateTime.compare(endDate, endOfDay) < 0 ? endDate : endOfDay;
		events.push({
			...event,
			start: eventStart.toPlainDateTime().toString(),
			end: eventEnd.toPlainDateTime().toString(),
			_originalStart: event.start,
			_originalEnd: event.end
		});
		currentDay = startOfDay.add({ days: 1 });
	}
	return events;
}
function spansMultipleDays(event) {
	const startDt = _js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(event.start));
	const endDt = _js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(event.end));
	return _js_temporal_polyfill.Temporal.PlainDate.compare(startDt.toPlainDate(), endDt.toPlainDate()) !== 0;
}
function splitEventsByDay(events, timeZone) {
	const out = [];
	for (const event of events) if (spansMultipleDays(event)) out.push(...splitMultiDay(event, timeZone));
	else out.push(event);
	return out;
}

//#endregion
exports.spansMultipleDays = spansMultipleDays;
exports.splitEventsByDay = splitEventsByDay;
exports.splitMultiDay = splitMultiDay;
//# sourceMappingURL=splitMultiDay.cjs.map