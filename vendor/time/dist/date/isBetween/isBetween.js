import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/isBetween/isBetween.ts
function isBetween(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { range: { start, end }, timeZone = defaultTimeZone, calendar = defaultCalendar, inclusive = true } = options;
	const zdt = toZonedDateTime(date, timeZone, calendar);
	const zdtStart = toZonedDateTime(start, timeZone, calendar);
	const zdtEnd = toZonedDateTime(end, timeZone, calendar);
	const compareStart = Temporal.ZonedDateTime.compare(zdt, zdtStart);
	const compareEnd = Temporal.ZonedDateTime.compare(zdt, zdtEnd);
	if (inclusive === true) return compareStart >= 0 && compareEnd <= 0;
	else if (inclusive === "start") return compareStart >= 0 && compareEnd < 0;
	else if (inclusive === "end") return compareStart > 0 && compareEnd <= 0;
	else return compareStart > 0 && compareEnd < 0;
}

//#endregion
export { isBetween };
//# sourceMappingURL=isBetween.js.map