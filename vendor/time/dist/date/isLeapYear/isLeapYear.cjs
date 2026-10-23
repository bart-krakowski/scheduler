const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');

//#region src/date/isLeapYear/isLeapYear.ts
function isLeapYear(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	return require_toZonedDateTime.toZonedDateTime(date, timeZone, calendar).inLeapYear;
}

//#endregion
exports.isLeapYear = isLeapYear;
//# sourceMappingURL=isLeapYear.cjs.map