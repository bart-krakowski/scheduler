const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');
const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/date/min/min.ts
function min(dates, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	if (dates.length === 0) throw new Error("min requires at least one date");
	let minZdt = require_toZonedDateTime.toZonedDateTime(dates[0], timeZone, calendar);
	for (let i = 1; i < dates.length; i++) {
		const zdt = require_toZonedDateTime.toZonedDateTime(dates[i], timeZone, calendar);
		if (_js_temporal_polyfill.Temporal.ZonedDateTime.compare(zdt, minZdt) < 0) minZdt = zdt;
	}
	return require_withDateOperation.toInstantDate(minZdt);
}

//#endregion
exports.min = min;
//# sourceMappingURL=min.cjs.map