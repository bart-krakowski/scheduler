import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toInstantDate } from "../withDateOperation/withDateOperation.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/fromUnixTime/fromUnixTime.ts
function fromUnixTime(timestamp, options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
	const { timeZone = defaultTimeZone, calendar = defaultCalendar } = options ?? {};
	const zdt = Temporal.Instant.fromEpochMilliseconds(timestamp * 1e3).toZonedDateTimeISO(timeZone).withCalendar(calendar);
	return toInstantDate(zdt);
}

//#endregion
export { fromUnixTime };
//# sourceMappingURL=fromUnixTime.js.map