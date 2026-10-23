const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');
const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/date/max/max.ts
function max(dates, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	if (dates.length === 0) throw new Error("max requires at least one date");
	let maxZdt = require_toZonedDateTime.toZonedDateTime(dates[0], timeZone, calendar);
	for (let i = 1; i < dates.length; i++) {
		const zdt = require_toZonedDateTime.toZonedDateTime(dates[i], timeZone, calendar);
		if (_js_temporal_polyfill.Temporal.ZonedDateTime.compare(zdt, maxZdt) > 0) maxZdt = zdt;
	}
	return require_withDateOperation.toInstantDate(maxZdt);
}

//#endregion
exports.max = max;
//# sourceMappingURL=max.cjs.map