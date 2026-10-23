const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_getWeekInfo = require('../../polyfills/getWeekInfo.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');

//#region src/date/isWeekend/isWeekend.ts
function isWeekend(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar, locale: defaultLocale } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar, locale = defaultLocale } = options ?? {};
	const dayOfWeek = require_toZonedDateTime.toZonedDateTime(date, timeZone, calendar).dayOfWeek;
	return require_getWeekInfo.getWeekInfo(locale).weekend.includes(dayOfWeek);
}

//#endregion
exports.isWeekend = isWeekend;
//# sourceMappingURL=isWeekend.cjs.map