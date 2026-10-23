import { getWeekInfo } from "../polyfills/getWeekInfo.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/utils/weekUtils.ts
function getFirstDayOfMonth(yearMonth) {
	const [year, month] = yearMonth.split("-").map(Number);
	if (!year || !month) throw new Error(`Invalid yearMonth format: ${yearMonth}. Expected YYYY-MM`);
	return Temporal.PlainDate.from({
		year,
		month,
		day: 1
	});
}
function getFirstDayOfWeek(dateString, locale) {
	const date = Temporal.PlainDate.from(dateString);
	const firstDayOfWeek = getWeekInfo(locale).firstDay;
	const daysToSubtract = (date.dayOfWeek - firstDayOfWeek + 7) % 7;
	return date.subtract({ days: daysToSubtract });
}

//#endregion
export { getFirstDayOfMonth, getFirstDayOfWeek };
//# sourceMappingURL=weekUtils.js.map