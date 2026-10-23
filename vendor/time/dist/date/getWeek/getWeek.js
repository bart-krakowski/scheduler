import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";

//#region src/date/getWeek/getWeek.ts
function getWeek(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	return toZonedDateTime(date, timeZone, calendar).weekOfYear ?? 0;
}

//#endregion
export { getWeek };
//# sourceMappingURL=getWeek.js.map