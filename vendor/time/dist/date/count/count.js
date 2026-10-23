import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { startOf } from "../startOf/startOf.js";

//#region src/date/count/count.ts
function count(start, end, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { unit, timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	const anchor = (date) => toZonedDateTime(startOf(date, {
		unit,
		timeZone,
		calendar
	}), timeZone, calendar);
	const startZdt = anchor(start);
	const endZdt = anchor(end);
	return startZdt.until(endZdt).total({
		unit,
		relativeTo: startZdt
	});
}

//#endregion
export { count };
//# sourceMappingURL=count.js.map