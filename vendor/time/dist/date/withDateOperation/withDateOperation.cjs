const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');

//#region src/date/withDateOperation/withDateOperation.ts
function resolveOptions(options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	return {
		timeZone,
		calendar
	};
}
function toInstantDate(zdt) {
	return new Date(zdt.epochMilliseconds);
}
function withDateOperation(fn) {
	return (input, options) => {
		const resolved = resolveOptions(options);
		return toInstantDate(fn(require_toZonedDateTime.toZonedDateTime(input, resolved.timeZone, resolved.calendar), options));
	};
}

//#endregion
exports.resolveOptions = resolveOptions;
exports.toInstantDate = toInstantDate;
exports.withDateOperation = withDateOperation;
//# sourceMappingURL=withDateOperation.cjs.map