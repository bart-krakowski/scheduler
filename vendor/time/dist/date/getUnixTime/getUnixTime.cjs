const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');

//#region src/date/getUnixTime/getUnixTime.ts
function getUnixTime(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const zdt = require_toZonedDateTime.toZonedDateTime(date, timeZone, calendar);
	return Number(zdt.epochNanoseconds / 1000000000n);
}

//#endregion
exports.getUnixTime = getUnixTime;
//# sourceMappingURL=getUnixTime.cjs.map