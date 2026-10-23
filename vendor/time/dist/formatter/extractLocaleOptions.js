import { getDateTimeDefaults } from "../utils/dateTimeDefaults.js";

//#region src/formatter/extractLocaleOptions.ts
function extractLocaleOptions({ localeMatcher, calendar = getDateTimeDefaults().calendar, timeZone = getDateTimeDefaults().timeZone, numberingSystem, hour12, hourCycle, ...formatOptions }) {
	return {
		localeMatcher,
		calendar,
		numberingSystem,
		hour12,
		hourCycle,
		timeZone,
		formatOptions
	};
}

//#endregion
export { extractLocaleOptions };
//# sourceMappingURL=extractLocaleOptions.js.map