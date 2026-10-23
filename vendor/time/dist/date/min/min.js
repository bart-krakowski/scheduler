import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { toInstantDate } from "../withDateOperation/withDateOperation.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/min/min.ts
function min(dates, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	if (dates.length === 0) throw new Error("min requires at least one date");
	let minZdt = toZonedDateTime(dates[0], timeZone, calendar);
	for (let i = 1; i < dates.length; i++) {
		const zdt = toZonedDateTime(dates[i], timeZone, calendar);
		if (Temporal.ZonedDateTime.compare(zdt, minZdt) < 0) minZdt = zdt;
	}
	return toInstantDate(minZdt);
}

//#endregion
export { min };
//# sourceMappingURL=min.js.map