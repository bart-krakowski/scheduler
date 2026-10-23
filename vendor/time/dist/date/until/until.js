import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";

//#region src/date/until/until.ts
function until(start, end, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	const startZdt = toZonedDateTime(start, timeZone, calendar);
	const endZdt = toZonedDateTime(end, timeZone, calendar);
	const duration = startZdt.until(endZdt);
	const unit = options.unit;
	return duration.total({
		unit,
		relativeTo: startZdt
	});
}

//#endregion
export { until };
//# sourceMappingURL=until.js.map