const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');

//#region src/date/until/until.ts
function until(start, end, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	const startZdt = require_toZonedDateTime.toZonedDateTime(start, timeZone, calendar);
	const endZdt = require_toZonedDateTime.toZonedDateTime(end, timeZone, calendar);
	const duration = startZdt.until(endZdt);
	const unit = options.unit;
	return duration.total({
		unit,
		relativeTo: startZdt
	});
}

//#endregion
exports.until = until;
//# sourceMappingURL=until.cjs.map