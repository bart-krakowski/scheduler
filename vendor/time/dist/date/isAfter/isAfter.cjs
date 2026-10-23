const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/date/isAfter/isAfter.ts
function isAfter(date1, date2, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const zdt1 = require_toZonedDateTime.toZonedDateTime(date1, timeZone, calendar);
	const zdt2 = require_toZonedDateTime.toZonedDateTime(date2, timeZone, calendar);
	return _js_temporal_polyfill.Temporal.ZonedDateTime.compare(zdt1, zdt2) > 0;
}

//#endregion
exports.isAfter = isAfter;
//# sourceMappingURL=isAfter.cjs.map