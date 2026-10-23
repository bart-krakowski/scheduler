import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";
import { toInstantDate } from "../withDateOperation/withDateOperation.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/max/max.ts
function max(dates, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	if (dates.length === 0) throw new Error("max requires at least one date");
	let maxZdt = toZonedDateTime(dates[0], timeZone, calendar);
	for (let i = 1; i < dates.length; i++) {
		const zdt = toZonedDateTime(dates[i], timeZone, calendar);
		if (Temporal.ZonedDateTime.compare(zdt, maxZdt) > 0) maxZdt = zdt;
	}
	return toInstantDate(maxZdt);
}

//#endregion
export { max };
//# sourceMappingURL=max.js.map