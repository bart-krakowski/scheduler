const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');

//#region src/date/getWeek/getWeek.ts
function getWeek(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	return require_toZonedDateTime.toZonedDateTime(date, timeZone, calendar).weekOfYear ?? 0;
}

//#endregion
exports.getWeek = getWeek;
//# sourceMappingURL=getWeek.cjs.map