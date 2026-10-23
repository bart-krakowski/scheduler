import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { startOf } from "../startOf/startOf.js";

//#region src/date/equals/equals.ts
function equals(date1, date2, unit, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const anchor = (date) => {
		const start = startOf(date, {
			unit,
			timeZone,
			calendar
		});
		return unit === "week" ? startOf(start, {
			unit: "day",
			timeZone,
			calendar
		}) : start;
	};
	return anchor(date1).getTime() === anchor(date2).getTime();
}

//#endregion
export { equals };
//# sourceMappingURL=equals.js.map