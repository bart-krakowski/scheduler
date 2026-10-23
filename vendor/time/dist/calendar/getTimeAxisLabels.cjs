//#region src/calendar/getTimeAxisLabels.ts
const labelCache = /* @__PURE__ */ new Map();
function getTimeAxisLabels(locale, options) {
	const { startHour = 0, endHour = 24, interval = 60 } = options ?? {};
	const cacheKey = `${locale}|${startHour}|${endHour}|${interval}`;
	const cached = labelCache.get(cacheKey);
	if (cached) return cached;
	const labels = [];
	const totalMinutes = (endHour - startHour) * 60;
	const count = Math.floor(totalMinutes / interval);
	const formatter = new Intl.DateTimeFormat(locale, {
		hour: "numeric",
		minute: "2-digit"
	});
	for (let i = 0; i < count; i++) {
		const totalMinutesFromStart = startHour * 60 + i * interval;
		const hour = Math.floor(totalMinutesFromStart / 60);
		const minute = totalMinutesFromStart % 60;
		if (hour >= 24) break;
		const date = new Date(2024, 0, 1, hour, minute);
		const label = formatter.format(date);
		labels.push({
			hour,
			minute,
			label
		});
	}
	labelCache.set(cacheKey, labels);
	return labels;
}
const getTimeSlots = getTimeAxisLabels;

//#endregion
exports.getTimeAxisLabels = getTimeAxisLabels;
exports.getTimeSlots = getTimeSlots;
//# sourceMappingURL=getTimeAxisLabels.cjs.map