const require_parse = require('../date/parse/parse.cjs');
const require_expandRecurringEvent = require('./expandRecurringEvent.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/recurrence/occurrence.ts
const OCCURRENCE_ID = /^(.+)_\d+$/;
const DEFAULT_HORIZON_YEARS = 4;
const isoDateOf = (value) => require_parse.toPlainDateTimeString(value).slice(0, 10);
function masterIdOf(eventId) {
	return eventId.match(OCCURRENCE_ID)?.[1] ?? eventId;
}
function nextOccurrenceDate(master, fromIsoDate, horizonYears = DEFAULT_HORIZON_YEARS) {
	if (!master.recurrence) return null;
	const from = _js_temporal_polyfill.Temporal.PlainDate.from(fromIsoDate);
	const searchStart = from.add({ days: 1 }).toString({ calendarName: "never" });
	const first = require_expandRecurringEvent.expandRecurringEvent(master, searchStart, from.add({ years: horizonYears }).toString({ calendarName: "never" })).find((occurrence) => isoDateOf(occurrence.start) >= searchStart);
	return first ? isoDateOf(first.start) : null;
}
function previousOccurrenceDate(master, fromIsoDate) {
	if (!master.recurrence) return null;
	const masterStart = isoDateOf(master.start);
	if (masterStart >= fromIsoDate) return null;
	return require_expandRecurringEvent.expandRecurringEvent(master, masterStart, fromIsoDate).map((occurrence) => isoDateOf(occurrence.start)).filter((isoDate) => isoDate < fromIsoDate).at(-1) ?? null;
}

//#endregion
exports.masterIdOf = masterIdOf;
exports.nextOccurrenceDate = nextOccurrenceDate;
exports.previousOccurrenceDate = previousOccurrenceDate;
//# sourceMappingURL=occurrence.cjs.map