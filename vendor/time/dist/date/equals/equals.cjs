const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_startOf = require('../startOf/startOf.cjs');

//#region src/date/equals/equals.ts
function equals(date1, date2, unit, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const anchor = (date) => {
		const start = require_startOf.startOf(date, {
			unit,
			timeZone,
			calendar
		});
		return unit === "week" ? require_startOf.startOf(start, {
			unit: "day",
			timeZone,
			calendar
		}) : start;
	};
	return anchor(date1).getTime() === anchor(date2).getTime();
}

//#endregion
exports.equals = equals;
//# sourceMappingURL=equals.cjs.map