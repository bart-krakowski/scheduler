const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');
const require_startOf = require('../startOf/startOf.cjs');

//#region src/date/count/count.ts
function count(start, end, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { unit, timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	const anchor = (date) => require_toZonedDateTime.toZonedDateTime(require_startOf.startOf(date, {
		unit,
		timeZone,
		calendar
	}), timeZone, calendar);
	const startZdt = anchor(start);
	const endZdt = anchor(end);
	return startZdt.until(endZdt).total({
		unit,
		relativeTo: startZdt
	});
}

//#endregion
exports.count = count;
//# sourceMappingURL=count.cjs.map