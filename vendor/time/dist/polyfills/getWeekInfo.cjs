const require_dateTimeDefaults = require('../utils/dateTimeDefaults.cjs');
const require_weekInfoData = require('./weekInfoData.cjs');

//#region src/polyfills/getWeekInfo.ts
const normalizeLocale = (loc) => {
	const [lang, region] = loc.split("-");
	return region ? `${lang?.toLowerCase()}-${region.toUpperCase()}` : lang?.toLowerCase();
};
const DEFAULT_WEEK_INFO = {
	firstDay: 7,
	weekend: [6, 7],
	minimalDays: 1
};
function lookupWeekInfo(localeString) {
	const normalizedLocale = normalizeLocale(localeString);
	let match = require_weekInfoData.weekInfoData[normalizedLocale ?? ""];
	if (!match) {
		const mainLanguage = normalizedLocale?.split("-")[0];
		match = require_weekInfoData.weekInfoData[mainLanguage ?? ""];
	}
	if (!match) match = Object.entries(require_weekInfoData.weekInfoData).find(([key]) => normalizeLocale(key) === normalizedLocale)?.[1];
	if (!match) match = require_weekInfoData.weekInfoData.en ?? require_weekInfoData.weekInfoData["en-US"] ?? DEFAULT_WEEK_INFO;
	return match;
}
function getWeekInfo(locale) {
	return lookupWeekInfo(locale == null ? require_dateTimeDefaults.getDateTimeDefaults().locale : typeof locale === "string" ? locale : locale.toString());
}
if (typeof Intl !== "undefined") {
	const { prototype } = Intl.Locale;
	if ("weekInfo" in prototype && typeof prototype.getWeekInfo !== "function") prototype.getWeekInfo = function() {
		return this.weekInfo;
	};
	else if (typeof prototype.getWeekInfo !== "function") prototype.getWeekInfo = function() {
		return lookupWeekInfo(this.toString());
	};
}

//#endregion
exports.getWeekInfo = getWeekInfo;
//# sourceMappingURL=getWeekInfo.cjs.map