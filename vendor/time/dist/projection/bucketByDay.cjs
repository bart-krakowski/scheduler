const require_parse = require('../date/parse/parse.cjs');
const require_splitMultiDay = require('./splitMultiDay.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/projection/bucketByDay.ts
function bucketByDay(events, timeZone) {
	const buckets = /* @__PURE__ */ new Map();
	for (const event of require_splitMultiDay.splitEventsByDay(events, timeZone)) {
		const dateKey = _js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(event.start)).toPlainDate().toString({ calendarName: "never" });
		let bucket = buckets.get(dateKey);
		if (!bucket) {
			bucket = [];
			buckets.set(dateKey, bucket);
		}
		bucket.push(event);
	}
	return buckets;
}
function buildDays(input) {
	const buckets = bucketByDay(input.events, input.timeZone);
	const today = input.today ?? _js_temporal_polyfill.Temporal.Now.plainDateISO().toString({ calendarName: "never" });
	return input.isoDates.map((isoDate) => {
		const dailyEvents = buckets.get(isoDate) ?? [];
		const events = [];
		const allDayEvents = [];
		for (const event of dailyEvents) if (event.allDay) allDayEvents.push(event);
		else events.push(event);
		return {
			isoDate,
			events,
			allDayEvents,
			isToday: isoDate === today,
			isInCurrentPeriod: input.isInCurrentPeriod?.(isoDate) ?? true
		};
	});
}

//#endregion
exports.bucketByDay = bucketByDay;
exports.buildDays = buildDays;
//# sourceMappingURL=bucketByDay.cjs.map