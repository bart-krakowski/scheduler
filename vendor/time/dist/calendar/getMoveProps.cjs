let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/calendar/getMoveProps.ts
const DEFAULT_SNAP_TO_MINUTES = 15;
const MS_PER_MINUTE = 6e4;
const extractDate = (value) => value.split("T")[0] ?? value;
function snapToInterval(minutes, interval) {
	if (!Number.isFinite(minutes)) return 0;
	if (interval <= 1) return Math.round(minutes);
	return Math.round(minutes / interval) * interval;
}
function calculateDayShift(fromDate, toDate) {
	return _js_temporal_polyfill.Temporal.PlainDate.from(extractDate(fromDate)).until(_js_temporal_polyfill.Temporal.PlainDate.from(extractDate(toDate)), { largestUnit: "day" }).days;
}
function calculateMovedEvent(options) {
	const { originalStart, originalEnd, granularity = "time", timeZone, constraints = {} } = options;
	const { snapToMinutes = DEFAULT_SNAP_TO_MINUTES } = constraints;
	const dayShift = Math.round(options.dayShift ?? 0);
	const minuteShift = granularity === "day" ? 0 : snapToInterval(options.minuteShift ?? 0, snapToMinutes);
	const shift = (value) => _js_temporal_polyfill.Temporal.PlainDateTime.from(value).add({ days: dayShift }).add({ minutes: minuteShift });
	const start = shift(originalStart);
	const end = shift(originalEnd);
	const durationMs = end.toZonedDateTime(timeZone).epochMilliseconds - start.toZonedDateTime(timeZone).epochMilliseconds;
	return {
		start: start.toString(),
		end: end.toString(),
		durationMinutes: Math.floor(durationMs / MS_PER_MINUTE),
		dayShift,
		minuteShift,
		moved: dayShift !== 0 || minuteShift !== 0
	};
}

//#endregion
exports.calculateDayShift = calculateDayShift;
exports.calculateMovedEvent = calculateMovedEvent;
exports.snapToInterval = snapToInterval;
//# sourceMappingURL=getMoveProps.cjs.map