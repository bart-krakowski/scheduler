const require_getWeekInfo = require('../polyfills/getWeekInfo.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/utils/weekUtils.ts
function getFirstDayOfMonth(yearMonth) {
	const [year, month] = yearMonth.split("-").map(Number);
	if (!year || !month) throw new Error(`Invalid yearMonth format: ${yearMonth}. Expected YYYY-MM`);
	return _js_temporal_polyfill.Temporal.PlainDate.from({
		year,
		month,
		day: 1
	});
}
function getFirstDayOfWeek(dateString, locale) {
	const date = _js_temporal_polyfill.Temporal.PlainDate.from(dateString);
	const firstDayOfWeek = require_getWeekInfo.getWeekInfo(locale).firstDay;
	const daysToSubtract = (date.dayOfWeek - firstDayOfWeek + 7) % 7;
	return date.subtract({ days: daysToSubtract });
}

//#endregion
exports.getFirstDayOfMonth = getFirstDayOfMonth;
exports.getFirstDayOfWeek = getFirstDayOfWeek;
//# sourceMappingURL=weekUtils.cjs.map