const require_dateTimeDefaults = require('../utils/dateTimeDefaults.cjs');

//#region src/formatter/extractLocaleOptions.ts
function extractLocaleOptions({ localeMatcher, calendar = require_dateTimeDefaults.getDateTimeDefaults().calendar, timeZone = require_dateTimeDefaults.getDateTimeDefaults().timeZone, numberingSystem, hour12, hourCycle, ...formatOptions }) {
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
exports.extractLocaleOptions = extractLocaleOptions;
//# sourceMappingURL=extractLocaleOptions.cjs.map