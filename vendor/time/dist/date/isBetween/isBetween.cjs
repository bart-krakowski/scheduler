const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/date/isBetween/isBetween.ts
function isBetween(date, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { range: { start, end }, timeZone = defaultTimeZone, calendar = defaultCalendar, inclusive = true } = options;
	const zdt = require_toZonedDateTime.toZonedDateTime(date, timeZone, calendar);
	const zdtStart = require_toZonedDateTime.toZonedDateTime(start, timeZone, calendar);
	const zdtEnd = require_toZonedDateTime.toZonedDateTime(end, timeZone, calendar);
	const compareStart = _js_temporal_polyfill.Temporal.ZonedDateTime.compare(zdt, zdtStart);
	const compareEnd = _js_temporal_polyfill.Temporal.ZonedDateTime.compare(zdt, zdtEnd);
	if (inclusive === true) return compareStart >= 0 && compareEnd <= 0;
	else if (inclusive === "start") return compareStart >= 0 && compareEnd < 0;
	else if (inclusive === "end") return compareStart > 0 && compareEnd <= 0;
	else return compareStart > 0 && compareEnd < 0;
}

//#endregion
exports.isBetween = isBetween;
//# sourceMappingURL=isBetween.cjs.map