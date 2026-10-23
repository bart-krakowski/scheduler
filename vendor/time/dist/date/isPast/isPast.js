import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/isPast/isPast.ts
function isPast(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const zdt = toZonedDateTime(date, timeZone, calendar);
	const now = Temporal.Now.zonedDateTimeISO(timeZone).withCalendar(calendar);
	return Temporal.ZonedDateTime.compare(zdt, now) < 0;
}

//#endregion
export { isPast };
//# sourceMappingURL=isPast.js.map