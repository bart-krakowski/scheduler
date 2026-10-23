let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/calendar/generateDateRange.ts
const generateDateRange = (start, end) => {
	const startDate = _js_temporal_polyfill.Temporal.PlainDate.from(start);
	const endDate = _js_temporal_polyfill.Temporal.PlainDate.from(end);
	const dates = [];
	let current = startDate;
	while (_js_temporal_polyfill.Temporal.PlainDate.compare(current, endDate) <= 0) {
		dates.push(current);
		current = current.add({ days: 1 });
	}
	return dates;
};

//#endregion
exports.generateDateRange = generateDateRange;
//# sourceMappingURL=generateDateRange.cjs.map