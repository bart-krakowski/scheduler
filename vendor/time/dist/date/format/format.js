import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { toInstantDate } from "../withDateOperation/withDateOperation.js";
import { buildFinalFormatter } from "../../formatter/buildFinalFormatter/buildFinalFormatter.js";
import { buildDateFormatter } from "../../formatter/buildDateFormatter/buildDateFormatter.js";
import { buildTimeFormatter } from "../../formatter/buildTimeFormatter/buildTimeFormatter.js";
import { buildDateTimeFormatter } from "../../formatter/buildDateTimeFormatter/buildDateTimeFormatter.js";

//#region src/date/format/format.ts
function format(date, formatOptions) {
	const { locale: defaultLocale, timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { type = "datetime", locale = defaultLocale, timeZone = defaultTimeZone, calendar = defaultCalendar, options } = formatOptions ?? {};
	const zdt = toZonedDateTime(date, timeZone, calendar);
	const dateObj = toInstantDate(zdt);
	const mergedOptions = typeof options === "string" ? options : {
		...options,
		timeZone,
		calendar
	};
	let formatter;
	switch (type) {
		case "date":
			formatter = buildDateFormatter({
				locale,
				options: mergedOptions
			});
			break;
		case "time":
			formatter = buildTimeFormatter({
				locale,
				options: mergedOptions
			});
			break;
		default: formatter = buildDateTimeFormatter({
			locale,
			options: mergedOptions
		});
	}
	return buildFinalFormatter({
		formatter,
		formatterName: "format"
	})(dateObj);
}

//#endregion
export { format };
//# sourceMappingURL=format.js.map