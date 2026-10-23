const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');

//#region src/date/since/since.ts
function since(start, end, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	const startZdt = require_toZonedDateTime.toZonedDateTime(start, timeZone, calendar);
	return require_toZonedDateTime.toZonedDateTime(end, timeZone, calendar).since(startZdt).total({
		unit: options.unit,
		relativeTo: startZdt
	});
}

//#endregion
exports.since = since;
//# sourceMappingURL=since.cjs.map