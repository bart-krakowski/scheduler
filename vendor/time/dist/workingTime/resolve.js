import { MINUTES_IN_DAY, formatMinutesToTime, getWeekday, mergeMinuteRanges, parseHmToMinutes } from "./minutes.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/workingTime/resolve.ts
function resolveCalendarChain(calendarId, calendars) {
	if (!calendarId || !calendars || calendars.length === 0) return [];
	const chain = [];
	const seen = /* @__PURE__ */ new Set();
	let cursor = calendarId;
	while (cursor) {
		if (seen.has(cursor)) throw new Error(`Working calendar cycle: ${[...seen, cursor].join(" -> ")}`);
		seen.add(cursor);
		const calendar = calendars.find((candidate) => candidate.id === cursor);
		if (!calendar) break;
		chain.unshift(calendar);
		cursor = calendar.parentId;
	}
	return chain;
}
function resolveCalendarTimeZone(calendarId, calendars) {
	const chain = resolveCalendarChain(calendarId, calendars);
	for (let index = chain.length - 1; index >= 0; index--) {
		const timeZone = chain[index].timeZone;
		if (timeZone !== void 0) return timeZone;
	}
}
function hasWorkingCalendar(calendarId, calendars) {
	return resolveCalendarChain(calendarId, calendars).length > 0;
}
function hasAnyWorkingCalendar(calendarIds, calendars) {
	return calendarIds.some((calendarId) => hasWorkingCalendar(calendarId, calendars));
}
function specificity(interval) {
	const dated = interval.startDate !== void 0 || interval.endDate !== void 0;
	if (interval.recurrent) return dated ? 1 : 0;
	return 2;
}
function spanOn(interval, day) {
	if (interval.startDate && day < interval.startDate) return null;
	if (interval.endDate && day > interval.endDate) return null;
	if (interval.recurrent) {
		if (!interval.recurrent.weekdays.includes(getWeekday(day))) return null;
		const startMinutes = parseHmToMinutes(interval.recurrent.startTime);
		const endMinutes = parseHmToMinutes(interval.recurrent.endTime);
		return endMinutes > startMinutes ? {
			startMinutes,
			endMinutes
		} : null;
	}
	const isFirstDay = !interval.startDate || day === interval.startDate;
	const isLastDay = !interval.endDate || day === interval.endDate;
	const startMinutes = isFirstDay && interval.startTime ? parseHmToMinutes(interval.startTime) : 0;
	const endMinutes = isLastDay && interval.endTime ? parseHmToMinutes(interval.endTime) : MINUTES_IN_DAY;
	return endMinutes > startMinutes ? {
		startMinutes,
		endMinutes
	} : null;
}
function resolveLayeredDayMinutes(calendarIds, date, calendars) {
	const chain = calendarIds.flatMap((calendarId) => resolveCalendarChain(calendarId, calendars));
	if (chain.length === 0) return [];
	const day = date.slice(0, 10);
	const canvas = new Uint8Array(MINUTES_IN_DAY);
	const ordered = chain.flatMap((calendar, level) => calendar.intervals.map((interval, index) => ({
		interval,
		level,
		index
	}))).sort((a, b) => specificity(a.interval) - specificity(b.interval) || a.level - b.level || a.index - b.index);
	for (const { interval } of ordered) {
		const span = spanOn(interval, day);
		if (!span) continue;
		canvas.fill(interval.isWorking ? 1 : 0, span.startMinutes, span.endMinutes);
	}
	const ranges = [];
	let openedAt = -1;
	for (let minute = 0; minute < MINUTES_IN_DAY; minute++) if (canvas[minute] === 1) {
		if (openedAt === -1) openedAt = minute;
	} else if (openedAt !== -1) {
		ranges.push({
			startMinutes: openedAt,
			endMinutes: minute
		});
		openedAt = -1;
	}
	if (openedAt !== -1) ranges.push({
		startMinutes: openedAt,
		endMinutes: MINUTES_IN_DAY
	});
	return ranges;
}
function dayOf(value) {
	return value.slice(0, 10);
}
function minutesOf(value) {
	if (value.length < 16) return 0;
	return parseHmToMinutes(value.slice(11, 16));
}
function getWorkingTime(calendarId, range, calendars) {
	return getLayeredWorkingTime([[calendarId]], range, calendars);
}
function getLayeredWorkingTime(layers, range, calendars) {
	if (!hasAnyWorkingCalendar(layers.flat(), calendars)) return [];
	const startDay = dayOf(range.start);
	const endDay = dayOf(range.end);
	if (endDay < startDay) return [];
	const startMinutes = minutesOf(range.start);
	const endMinutes = minutesOf(range.end);
	const firstDate = Temporal.PlainDate.from(startDay);
	const lastDate = Temporal.PlainDate.from(endDay);
	const absolute = [];
	let cursor = firstDate;
	let dayIndex = 0;
	while (Temporal.PlainDate.compare(cursor, lastDate) <= 0) {
		const day = cursor.toString({ calendarName: "never" });
		const isFirst = dayIndex === 0;
		const isLast = day === endDay;
		const lowerBound = isFirst ? startMinutes : 0;
		const upperBound = isLast ? endMinutes : MINUTES_IN_DAY;
		if (upperBound > lowerBound) {
			const dayMinutes = mergeMinuteRanges(layers.flatMap((stack) => resolveLayeredDayMinutes(stack, day, calendars)));
			for (const span of dayMinutes) {
				const from = Math.max(span.startMinutes, lowerBound);
				const to = Math.min(span.endMinutes, upperBound);
				if (to <= from) continue;
				const offset = dayIndex * MINUTES_IN_DAY;
				const previous = absolute[absolute.length - 1];
				if (previous && previous.endMinutes === offset + from) previous.endMinutes = offset + to;
				else absolute.push({
					startMinutes: offset + from,
					endMinutes: offset + to
				});
			}
		}
		cursor = cursor.add({ days: 1 });
		dayIndex++;
	}
	const toStamp = (value) => {
		const date = firstDate.add({ days: Math.floor(value / MINUTES_IN_DAY) });
		const time = formatMinutesToTime(value % MINUTES_IN_DAY);
		return `${date.toString({ calendarName: "never" })}T${time}:00`;
	};
	return absolute.map((span) => ({
		start: toStamp(span.startMinutes),
		end: toStamp(span.endMinutes)
	}));
}

//#endregion
export { getLayeredWorkingTime, getWorkingTime, hasAnyWorkingCalendar, hasWorkingCalendar, resolveCalendarChain, resolveCalendarTimeZone, resolveLayeredDayMinutes };
//# sourceMappingURL=resolve.js.map