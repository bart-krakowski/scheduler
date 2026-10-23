const require_parse = require('../date/parse/parse.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/projection/timelineLayout.ts
const HOURS_IN_DAY = 24;
const hoursFromFirstDay = (value, firstDay) => {
	const dt = _js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(value));
	return firstDay.until(dt.toPlainDate()).days * HOURS_IN_DAY + dt.hour + dt.minute / 60 + dt.second / 3600;
};
function layoutTimelineRange(input) {
	const firstDay = _js_temporal_polyfill.Temporal.PlainDate.from(input.firstDay.slice(0, 10));
	const totalHours = input.totalDays * HOURS_IN_DAY;
	const items = [];
	const lanes = [];
	input.events.forEach((event, index) => {
		const rawStart = hoursFromFirstDay(event.start, firstDay) / totalHours;
		const rawEnd = hoursFromFirstDay(event.end, firstDay) / totalHours;
		const startFraction = Math.max(0, rawStart);
		const endFraction = Math.min(1, rawEnd);
		if (endFraction - startFraction <= 0) return;
		let lane = lanes.findIndex((placed) => !placed.some((item) => startFraction < item.end && endFraction > item.start));
		if (lane === -1) lane = lanes.length;
		(lanes[lane] ??= []).push({
			start: startFraction,
			end: endFraction
		});
		items.push({
			index,
			id: event.id,
			startFraction,
			endFraction,
			durationFraction: endFraction - startFraction,
			lane,
			isStartClipped: rawStart < 0,
			isEndClipped: rawEnd > 1
		});
	});
	return {
		items,
		laneCount: Math.max(1, lanes.length)
	};
}
function currentTimeFraction(input) {
	const dayIndex = input.isoDates.indexOf(input.now.isoDate);
	if (dayIndex < 0) return null;
	const hourFraction = input.now.hour + input.now.minute / 60;
	return (dayIndex * HOURS_IN_DAY + hourFraction) / (input.isoDates.length * HOURS_IN_DAY);
}

//#endregion
exports.currentTimeFraction = currentTimeFraction;
exports.layoutTimelineRange = layoutTimelineRange;
//# sourceMappingURL=timelineLayout.cjs.map