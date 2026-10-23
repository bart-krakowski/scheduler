import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";

//#region src/date/isLeapYear/isLeapYear.ts
function isLeapYear(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	return toZonedDateTime(date, timeZone, calendar).inLeapYear;
}

//#endregion
export { isLeapYear };
//# sourceMappingURL=isLeapYear.js.map