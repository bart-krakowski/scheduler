const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_toZonedDateTime = require('../helpers/toZonedDateTime.cjs');
const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');
const require_buildFinalFormatter = require('../../formatter/buildFinalFormatter/buildFinalFormatter.cjs');
const require_buildDateFormatter = require('../../formatter/buildDateFormatter/buildDateFormatter.cjs');
const require_buildTimeFormatter = require('../../formatter/buildTimeFormatter/buildTimeFormatter.cjs');
const require_buildDateTimeFormatter = require('../../formatter/buildDateTimeFormatter/buildDateTimeFormatter.cjs');

//#region src/date/format/format.ts
function format(date, formatOptions) {
	const { locale: defaultLocale, timeZone: defaultTimeZone, calendar: defaultCalendar } = require_dateTimeDefaults.getDateTimeDefaults();
	const { type = "datetime", locale = defaultLocale, timeZone = defaultTimeZone, calendar = defaultCalendar, options } = formatOptions ?? {};
	const zdt = require_toZonedDateTime.toZonedDateTime(date, timeZone, calendar);
	const dateObj = require_withDateOperation.toInstantDate(zdt);
	const mergedOptions = typeof options === "string" ? options : {
		...options,
		timeZone,
		calendar
	};
	let formatter;
	switch (type) {
		case "date":
			formatter = require_buildDateFormatter.buildDateFormatter({
				locale,
				options: mergedOptions
			});
			break;
		case "time":
			formatter = require_buildTimeFormatter.buildTimeFormatter({
				locale,
				options: mergedOptions
			});
			break;
		default: formatter = require_buildDateTimeFormatter.buildDateTimeFormatter({
			locale,
			options: mergedOptions
		});
	}
	return require_buildFinalFormatter.buildFinalFormatter({
		formatter,
		formatterName: "format"
	})(dateObj);
}

//#endregion
exports.format = format;
//# sourceMappingURL=format.cjs.map