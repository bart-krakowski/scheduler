const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');

//#region src/date/getDayOfYear/getDayOfYear.ts
function getDayOfYear(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	return require_toZonedDateTime.toZonedDateTime(date, timeZone, calendar).dayOfYear;
}

//#endregion
exports.getDayOfYear = getDayOfYear;
//# sourceMappingURL=getDayOfYear.cjs.map