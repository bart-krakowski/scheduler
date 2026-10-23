import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/isBefore/isBefore.ts
function isBefore(date1, date2, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const zdt1 = toZonedDateTime(date1, timeZone, calendar);
	const zdt2 = toZonedDateTime(date2, timeZone, calendar);
	return Temporal.ZonedDateTime.compare(zdt1, zdt2) < 0;
}

//#endregion
export { isBefore };
//# sourceMappingURL=isBefore.js.map