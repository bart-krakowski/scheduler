const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/date/intersects/intersects.ts
function intersects(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { range: { start, end }, timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	const zdt = require_toZonedDateTime.toZonedDateTime(date, timeZone, calendar);
	const zdtStart = require_toZonedDateTime.toZonedDateTime(start, timeZone, calendar);
	const zdtEnd = require_toZonedDateTime.toZonedDateTime(end, timeZone, calendar);
	const compareStart = _js_temporal_polyfill.Temporal.ZonedDateTime.compare(zdt, zdtStart);
	const compareEnd = _js_temporal_polyfill.Temporal.ZonedDateTime.compare(zdt, zdtEnd);
	return compareStart >= 0 && compareEnd <= 0;
}

//#endregion
exports.intersects = intersects;
//# sourceMappingURL=intersects.cjs.map