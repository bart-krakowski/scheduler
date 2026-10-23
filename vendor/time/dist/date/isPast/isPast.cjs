const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/date/isPast/isPast.ts
function isPast(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const zdt = require_toZonedDateTime.toZonedDateTime(date, timeZone, calendar);
	const now = _js_temporal_polyfill.Temporal.Now.zonedDateTimeISO(timeZone).withCalendar(calendar);
	return _js_temporal_polyfill.Temporal.ZonedDateTime.compare(zdt, now) < 0;
}

//#endregion
exports.isPast = isPast;
//# sourceMappingURL=isPast.cjs.map