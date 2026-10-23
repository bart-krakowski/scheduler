const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/date/fromUnixTime/fromUnixTime.ts
function fromUnixTime(timestamp, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const zdt = _js_temporal_polyfill.Temporal.Instant.fromEpochMilliseconds(timestamp * 1e3).toZonedDateTimeISO(timeZone).withCalendar(calendar);
	return require_withDateOperation.toInstantDate(zdt);
}

//#endregion
exports.fromUnixTime = fromUnixTime;
//# sourceMappingURL=fromUnixTime.cjs.map