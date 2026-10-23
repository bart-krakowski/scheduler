import { toPlainDateTimeString } from "../date/parse/parse.js";
import { splitEventsByDay } from "./splitMultiDay.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/projection/bucketByDay.ts
function bucketByDay(events, timeZone) {
	const buckets = /* @__PURE__ */ new Map();
	for (const event of splitEventsByDay(events, timeZone)) {
		const dateKey = Temporal.PlainDateTime.from(toPlainDateTimeString(event.start)).toPlainDate().toString({ calendarName: "never" });
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
	const today = input.today ?? Temporal.Now.plainDateISO().toString({ calendarName: "never" });
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
export { bucketByDay, buildDays };
//# sourceMappingURL=bucketByDay.js.map