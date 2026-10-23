import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";

//#region src/date/getDayOfYear/getDayOfYear.ts
function getDayOfYear(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	return toZonedDateTime(date, timeZone, calendar).dayOfYear;
}

//#endregion
export { getDayOfYear };
//# sourceMappingURL=getDayOfYear.js.map