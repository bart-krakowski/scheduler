import { toPlainDateTimeString } from "../date/parse/parse.js";
import { expandRecurringEvent } from "./expandRecurringEvent.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/recurrence/occurrence.ts
const OCCURRENCE_ID = /^(.+)_\d+$/;
const DEFAULT_HORIZON_YEARS = 4;
const isoDateOf = (value) => toPlainDateTimeString(value).slice(0, 10);
function masterIdOf(eventId) {
	return eventId.match(OCCURRENCE_ID)?.[1] ?? eventId;
}
function nextOccurrenceDate(master, fromIsoDate, horizonYears = DEFAULT_HORIZON_YEARS) {
	if (!master.recurrence) return null;
	const from = Temporal.PlainDate.from(fromIsoDate);
	const searchStart = from.add({ days: 1 }).toString({ calendarName: "never" });
	const first = expandRecurringEvent(master, searchStart, from.add({ years: horizonYears }).toString({ calendarName: "never" })).find((occurrence) => isoDateOf(occurrence.start) >= searchStart);
	return first ? isoDateOf(first.start) : null;
}
function previousOccurrenceDate(master, fromIsoDate) {
	if (!master.recurrence) return null;
	const masterStart = isoDateOf(master.start);
	if (masterStart >= fromIsoDate) return null;
	return expandRecurringEvent(master, masterStart, fromIsoDate).map((occurrence) => isoDateOf(occurrence.start)).filter((isoDate) => isoDate < fromIsoDate).at(-1) ?? null;
}

//#endregion
export { masterIdOf, nextOccurrenceDate, previousOccurrenceDate };
//# sourceMappingURL=occurrence.js.map