import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { startOf } from "../startOf/startOf.js";

//#region src/date/isSameOrAfter/isSameOrAfter.ts
function isSameOrAfter(date1, date2, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	const anchor = (date) => {
		const start = startOf(date, {
			unit: options.unit,
			timeZone,
			calendar
		});
		return options.unit === "week" ? startOf(start, {
			unit: "day",
			timeZone,
			calendar
		}) : start;
	};
	return anchor(date1).getTime() >= anchor(date2).getTime();
}

//#endregion
export { isSameOrAfter };
//# sourceMappingURL=isSameOrAfter.js.map