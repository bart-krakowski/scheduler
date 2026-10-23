import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/intersects/intersects.ts
function intersects(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { range: { start, end }, timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	const zdt = toZonedDateTime(date, timeZone, calendar);
	const zdtStart = toZonedDateTime(start, timeZone, calendar);
	const zdtEnd = toZonedDateTime(end, timeZone, calendar);
	const compareStart = Temporal.ZonedDateTime.compare(zdt, zdtStart);
	const compareEnd = Temporal.ZonedDateTime.compare(zdt, zdtEnd);
	return compareStart >= 0 && compareEnd <= 0;
}

//#endregion
export { intersects };
//# sourceMappingURL=intersects.js.map