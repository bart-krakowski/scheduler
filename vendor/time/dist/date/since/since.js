import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";

//#region src/date/since/since.ts
function since(start, end, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options;
	const startZdt = toZonedDateTime(start, timeZone, calendar);
	return toZonedDateTime(end, timeZone, calendar).since(startZdt).total({
		unit: options.unit,
		relativeTo: startZdt
	});
}

//#endregion
export { since };
//# sourceMappingURL=since.js.map