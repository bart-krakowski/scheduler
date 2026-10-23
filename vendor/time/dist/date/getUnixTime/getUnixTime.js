import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";

//#region src/date/getUnixTime/getUnixTime.ts
function getUnixTime(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const zdt = toZonedDateTime(date, timeZone, calendar);
	return Number(zdt.epochNanoseconds / 1000000000n);
}

//#endregion
export { getUnixTime };
//# sourceMappingURL=getUnixTime.js.map