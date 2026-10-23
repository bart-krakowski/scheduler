//#region src/workingTime/blocks.ts
const WEEKDAY_NUMBERS = {
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
	sunday: 7
};
const DAY_START = "00:00";
const DAY_END = "24:00";
const HM = /^(?:[01]\d|2[0-4]):[0-5]\d$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
function assertTime(value) {
	if (!HM.test(value)) throw new Error(`Invalid time "${value}": expected HH:MM between 00:00 and 24:00`);
	return value;
}
function assertDate(value) {
	if (!ISO_DATE.test(value)) throw new Error(`Invalid date "${value}": expected YYYY-MM-DD`);
	return value;
}
function toWeekdayNumber(day) {
	if (typeof day === "number") {
		if (!Number.isInteger(day) || day < 1 || day > 7) throw new Error(`Invalid weekday ${day}: expected 1 (Monday) through 7 (Sunday)`);
		return day;
	}
	const number = WEEKDAY_NUMBERS[day];
	if (number === void 0) throw new Error(`Invalid weekday "${day}"`);
	return number;
}
function weekday(...days) {
	if (days.length === 0) throw new Error("weekday() needs at least one day");
	return {
		isWorking: true,
		recurrent: {
			weekdays: [...new Set(days.map(toWeekdayNumber))].sort((a, b) => a - b),
			startTime: DAY_START,
			endTime: DAY_END
		}
	};
}
function date(isoDate) {
	const day = assertDate(isoDate);
	return {
		isWorking: true,
		startDate: day,
		endDate: day
	};
}
function dates(isoDates) {
	return isoDates.map(date);
}
function dateRange(start, end) {
	const from = assertDate(start);
	const to = assertDate(end);
	if (to < from) throw new Error(`dateRange(${start}, ${end}): end is before start`);
	return {
		isWorking: true,
		startDate: from,
		endDate: to
	};
}
function between(startTime, endTime) {
	const from = assertTime(startTime);
	const to = assertTime(endTime);
	if (to <= from) throw new Error(`between(${startTime}, ${endTime}): end is not after start`);
	return {
		isWorking: true,
		startTime: from,
		endTime: to
	};
}
function after(startTime) {
	return between(startTime, DAY_END);
}
function before(endTime) {
	return between(DAY_START, endTime);
}
function axesOf(fragment) {
	const axes = {};
	if (fragment.recurrent) {
		axes.weekdays = fragment.recurrent.weekdays;
		const { startTime, endTime } = fragment.recurrent;
		if (startTime !== DAY_START || endTime !== DAY_END) {
			axes.startTime = startTime;
			axes.endTime = endTime;
		}
	} else if (fragment.startTime !== void 0 || fragment.endTime !== void 0) {
		axes.startTime = fragment.startTime;
		axes.endTime = fragment.endTime;
	}
	if (fragment.startDate !== void 0) axes.startDate = fragment.startDate;
	if (fragment.endDate !== void 0) axes.endDate = fragment.endDate;
	return axes;
}
function merge(...fragments) {
	if (fragments.length === 0) throw new Error("merge() needs at least one fragment");
	const combined = {};
	for (const fragment of fragments) {
		const axes = axesOf(fragment);
		if (axes.weekdays) {
			if (combined.weekdays) throw new Error("merge(): two fragments constrain weekdays");
			combined.weekdays = axes.weekdays;
		}
		if (axes.startTime !== void 0 || axes.endTime !== void 0) {
			if (combined.startTime !== void 0 || combined.endTime !== void 0) throw new Error("merge(): two fragments constrain time of day");
			combined.startTime = axes.startTime;
			combined.endTime = axes.endTime;
		}
		if (axes.startDate !== void 0 || axes.endDate !== void 0) {
			if (combined.startDate !== void 0 || combined.endDate !== void 0) throw new Error("merge(): two fragments constrain dates");
			combined.startDate = axes.startDate;
			combined.endDate = axes.endDate;
		}
	}
	const interval = { isWorking: true };
	if (combined.startDate !== void 0) interval.startDate = combined.startDate;
	if (combined.endDate !== void 0) interval.endDate = combined.endDate;
	if (combined.weekdays) {
		interval.recurrent = {
			weekdays: combined.weekdays,
			startTime: combined.startTime ?? DAY_START,
			endTime: combined.endTime ?? DAY_END
		};
		return interval;
	}
	if (combined.startTime !== void 0) interval.startTime = combined.startTime;
	if (combined.endTime !== void 0) interval.endTime = combined.endTime;
	return interval;
}
function flatten(entries, isWorking) {
	return entries.flat().map((interval) => ({
		...interval,
		isWorking
	}));
}
function compileSchedule(spec) {
	const calendar = {
		id: spec.id,
		intervals: [...flatten(spec.on, true), ...flatten(spec.except ?? [], false)]
	};
	if (spec.label !== void 0) calendar.label = spec.label;
	if (spec.parentId !== void 0) calendar.parentId = spec.parentId;
	if (spec.timeZone !== void 0) calendar.timeZone = spec.timeZone;
	return calendar;
}

//#endregion
exports.after = after;
exports.before = before;
exports.between = between;
exports.compileSchedule = compileSchedule;
exports.date = date;
exports.dateRange = dateRange;
exports.dates = dates;
exports.merge = merge;
exports.weekday = weekday;
//# sourceMappingURL=blocks.cjs.map