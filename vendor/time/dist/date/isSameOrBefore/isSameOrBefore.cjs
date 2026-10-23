const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_startOf = require('../startOf/startOf.cjs');

//#region src/date/isSameOrBefore/isSameOrBefore.ts
function isSameOrBefore(date1, date2, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	const anchor = (date) => {
		const start = require_startOf.startOf(date, {
			unit: options.unit,
			timeZone,
			calendar
		});
		return options.unit === "week" ? require_startOf.startOf(start, {
			unit: "day",
			timeZone,
			calendar
		}) : start;
	};
	return anchor(date1).getTime() <= anchor(date2).getTime();
}

//#endregion
exports.isSameOrBefore = isSameOrBefore;
//# sourceMappingURL=isSameOrBefore.cjs.map