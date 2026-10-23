import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { toZonedDateTime } from "../helpers/toZonedDateTime.js";

//#region src/date/withDateOperation/withDateOperation.ts
function resolveOptions(options) {
	const { timeZone: defaultTimeZone, calendar: defaultCalendar } = getDateTimeDefaults();
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
		return toInstantDate(fn(toZonedDateTime(input, resolved.timeZone, resolved.calendar), options));
	};
}

//#endregion
export { resolveOptions, toInstantDate, withDateOperation };
//# sourceMappingURL=withDateOperation.js.map