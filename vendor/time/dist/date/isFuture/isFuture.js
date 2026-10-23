import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/isFuture/isFuture.ts
function isFuture(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const zdt = toZonedDateTime(date, timeZone, calendar);
	const now = Temporal.Now.zonedDateTimeISO(timeZone).withCalendar(calendar);
	return Temporal.ZonedDateTime.compare(zdt, now) > 0;
}

//#endregion
export { isFuture };
//# sourceMappingURL=isFuture.js.map