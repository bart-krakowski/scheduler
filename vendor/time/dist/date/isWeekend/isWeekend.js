import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { getWeekInfo } from "../../polyfills/getWeekInfo.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";

//#region src/date/isWeekend/isWeekend.ts
function isWeekend(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar, locale: defaultLocale } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar, locale = defaultLocale } = options ?? {};
	const dayOfWeek = toZonedDateTime(date, timeZone, calendar).dayOfWeek;
	return getWeekInfo(locale).weekend.includes(dayOfWeek);
}

//#endregion
export { isWeekend };
//# sourceMappingURL=isWeekend.js.map