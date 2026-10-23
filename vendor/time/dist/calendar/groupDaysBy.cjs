const require_getWeekInfo = require('../polyfills/getWeekInfo.cjs');
const require_getDateParts = require('../date/getDateParts/getDateParts.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/calendar/groupDaysBy.ts
const plainDateOf = (isoDate) => _js_temporal_polyfill.Temporal.PlainDate.from(isoDate);
const filler = (date, calendar) => {
	const isoDate = date.toString({ calendarName: "never" });
	return {
		isoDate,
		isoMonth: isoDate.slice(0, 7),
		dayOfMonth: require_getDateParts.toCalendarDate(isoDate, calendar).day,
		events: [],
		allDayEvents: [],
		isToday: false,
		isInCurrentPeriod: false
	};
};
const groupDaysBy = ({ days, unit, fillMissingDays = true, weekStartsOn, locale, calendar = "iso8601" }) => {
	const groups = [];
	const { weekend } = require_getWeekInfo.getWeekInfo(locale);
	switch (unit) {
		case "week": {
			const weeks = [];
			let currentWeek = [];
			days.forEach((day) => {
				const dayDate = day ? plainDateOf(day.isoDate) : null;
				if (currentWeek.length === 0 && dayDate?.dayOfWeek !== weekStartsOn) {
					if (dayDate) {
						const dayOfWeek = (dayDate.dayOfWeek - weekStartsOn + 7) % 7;
						for (let i = 0; i < dayOfWeek; i++) {
							const newDate = dayDate.subtract({ days: dayOfWeek - i });
							currentWeek.push(fillMissingDays ? filler(newDate, calendar) : null);
						}
					}
				}
				currentWeek.push(day);
				if (currentWeek.length === 7) {
					weeks.push(currentWeek);
					currentWeek = [];
				}
			});
			if (currentWeek.length > 0) {
				while (currentWeek.length < 7) {
					const lastIsoDate = currentWeek[currentWeek.length - 1]?.isoDate;
					const newDate = (lastIsoDate ? plainDateOf(lastIsoDate) : _js_temporal_polyfill.Temporal.PlainDate.from("2024-01-01")).add({ days: 1 });
					currentWeek.push(fillMissingDays ? filler(newDate, calendar) : null);
				}
				weeks.push(currentWeek);
			}
			return weeks;
		}
		case "workWeek": {
			const workWeeks = [];
			let currentWorkWeek = [];
			days.forEach((day) => {
				const dayDate = day ? plainDateOf(day.isoDate) : null;
				if (currentWorkWeek.length === 0 && dayDate?.dayOfWeek !== weekStartsOn) {
					if (dayDate) {
						const dayOfWeek = (dayDate.dayOfWeek - weekStartsOn + 7) % 7;
						for (let i = 0; i < dayOfWeek; i++) {
							const newDay = dayDate.subtract({ days: dayOfWeek - i });
							if (!weekend.includes(newDay.dayOfWeek)) currentWorkWeek.push(fillMissingDays ? filler(newDay, calendar) : null);
						}
					}
				}
				if (dayDate && day && !weekend.includes(dayDate.dayOfWeek)) currentWorkWeek.push(day);
				if (currentWorkWeek.length === 5) {
					workWeeks.push(currentWorkWeek);
					currentWorkWeek = [];
				}
			});
			if (currentWorkWeek.length > 0) {
				while (currentWorkWeek.length < 5) {
					const lastIsoDate = currentWorkWeek[currentWorkWeek.length - 1]?.isoDate;
					const nextDate = (lastIsoDate ? plainDateOf(lastIsoDate) : _js_temporal_polyfill.Temporal.PlainDate.from("2024-01-01")).add({ days: 1 });
					if (!weekend.includes(nextDate.dayOfWeek)) currentWorkWeek.push(fillMissingDays ? filler(nextDate, calendar) : null);
				}
				workWeeks.push(currentWorkWeek);
			}
			return workWeeks;
		}
	}
	return groups;
};

//#endregion
exports.groupDaysBy = groupDaysBy;
//# sourceMappingURL=groupDaysBy.cjs.map