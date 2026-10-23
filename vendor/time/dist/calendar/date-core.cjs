const require_dateRange = require('../utils/dateRange.cjs');
const require_dateTimeDefaults = require('../utils/dateTimeDefaults.cjs');
const require_weekUtils = require('../utils/weekUtils.cjs');
const require_buildDateFormatter = require('../formatter/buildDateFormatter/buildDateFormatter.cjs');
const require_buildTimeFormatter = require('../formatter/buildTimeFormatter/buildTimeFormatter.cjs');
const require_buildDateTimeFormatter = require('../formatter/buildDateTimeFormatter/buildDateTimeFormatter.cjs');
const require_getDateParts = require('../date/getDateParts/getDateParts.cjs');
const require_generateDateRange = require('./generateDateRange.cjs');
const require_TimeClient = require('../client/TimeClient.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");
let _tanstack_store = require("@tanstack/store");

//#region src/calendar/date-core.ts
function toTemporalPlainDateString(date) {
	if (date instanceof _js_temporal_polyfill.Temporal.PlainDate) return date.toString({ calendarName: "never" });
	if (date instanceof _js_temporal_polyfill.Temporal.ZonedDateTime) return date.toPlainDate().toString({ calendarName: "never" });
	if (date instanceof Date) return date.toISOString().split("T")[0];
	if (typeof date === "number") return new Date(date).toISOString().split("T")[0];
	return date;
}
function toDate(date) {
	if (date instanceof Date) return date;
	if (date instanceof _js_temporal_polyfill.Temporal.ZonedDateTime) return new Date(date.toPlainDate().toString({ calendarName: "auto" }));
	if (date instanceof _js_temporal_polyfill.Temporal.PlainDate) return new Date(date.year, date.month - 1, date.day);
	return new Date(date);
}
function toIsoDate(date) {
	return date.toString({ calendarName: "never" });
}
const periodFormatOptions = {
	day: {
		year: "numeric",
		month: "long",
		day: "numeric"
	},
	month: {
		year: "numeric",
		month: "long"
	},
	year: { year: "numeric" }
};
var DateCore = class {
	constructor(options) {
		this._dayNamesCache = /* @__PURE__ */ new Map();
		const defaults = require_dateTimeDefaults.getDateTimeDefaults();
		const parsedRange = require_dateRange.parseDateRange({
			range: options.range,
			calendar: defaults.calendar
		});
		this.options = {
			...defaults,
			...options,
			range: parsedRange
		};
		this.calendarId = require_getDateParts.resolveCalendarId(this.options.calendar);
		this.timeZoneId = typeof this.options.timeZone === "string" ? this.options.timeZone : this.options.timeZone.timeZoneId;
		this.formatters = {
			date: options.dateFormatter ?? require_buildDateFormatter.buildDateFormatter({ locale: this.options.locale }),
			time: options.timeFormatter ?? require_buildTimeFormatter.buildTimeFormatter({ locale: this.options.locale }),
			dateTime: options.dateTimeFormatter ?? require_buildDateTimeFormatter.buildDateTimeFormatter({ locale: this.options.locale })
		};
		const now = _js_temporal_polyfill.Temporal.Now.plainDateISO().withCalendar(this.options.calendar);
		const initialDate = require_dateRange.constrainDateToRange({
			date: now,
			range: this.options.range
		});
		this.store = new _tanstack_store.Store({
			currentPeriod: toIsoDate(initialDate),
			activeDate: toIsoDate(initialDate),
			viewMode: options.viewMode,
			eventsVersion: 0,
			isPending: false
		});
	}
	toPlainDate(isoDate) {
		return _js_temporal_polyfill.Temporal.PlainDate.from(isoDate).withCalendar(this.options.calendar);
	}
	get activeDatePlain() {
		return this.toPlainDate(this.store.state.activeDate);
	}
	get currentPeriodPlain() {
		return this.toPlainDate(this.store.state.currentPeriod);
	}
	getDateParts(date, options) {
		return require_getDateParts.getDateParts(date, {
			locale: options?.locale ?? this.options.locale,
			calendar: options?.calendar ?? this.calendarId,
			timeZone: options?.timeZone ?? this.timeZoneId
		});
	}
	formatPeriod(date, options) {
		const isoDate = date === void 0 ? this.store.state.currentPeriod : require_getDateParts.toIsoDateString(date, this.timeZoneId);
		const unit = options?.unit ?? "month";
		const locale = options?.locale ?? this.options.locale;
		const calendarId = options?.calendar ?? this.calendarId;
		return require_getDateParts.getDateFormatter(locale, calendarId, `period-${unit}`, periodFormatOptions[unit]).format(/* @__PURE__ */ new Date(`${isoDate}T00:00:00Z`));
	}
	formatDate(date) {
		return this.formatters.date.format(toDate(date));
	}
	formatTime(date) {
		return this.formatters.time.format(toDate(date));
	}
	formatDateTime(date) {
		return this.formatters.dateTime.format(toDate(date));
	}
	getFirstDayOfMonth() {
		return require_weekUtils.getFirstDayOfMonth(this.currentPeriodPlain.toString({ calendarName: "auto" }).substring(0, 7));
	}
	getFirstDayOfWeek() {
		return require_weekUtils.getFirstDayOfWeek(this.currentPeriodPlain.toString(), this.options.locale);
	}
	getWeekStartsOn() {
		return this.getFirstDayOfWeek().dayOfWeek;
	}
	getCalendarDays() {
		let start;
		switch (this.store.state.viewMode.unit) {
			case "month":
				start = this.getFirstDayOfMonth().subtract({ days: (this.getFirstDayOfMonth().dayOfWeek - (this.getFirstDayOfWeek().dayOfWeek + 1) + 7) % 7 });
				break;
			case "week":
			case "workWeek":
				start = this.getFirstDayOfWeek();
				break;
			default: start = this.currentPeriodPlain;
		}
		let end;
		switch (this.store.state.viewMode.unit) {
			case "month": {
				const lastDayOfMonth = this.getFirstDayOfMonth().add({ months: this.store.state.viewMode.value }).subtract({ days: 1 });
				const lastDayOfMonthWeekDay = (lastDayOfMonth.dayOfWeek - (this.getFirstDayOfWeek().dayOfWeek + 1) + 7) % 7;
				end = lastDayOfMonth.add({ days: 6 - lastDayOfMonthWeekDay });
				break;
			}
			case "week":
				end = this.getFirstDayOfWeek().add({ days: 7 * this.store.state.viewMode.value - 1 });
				break;
			case "day":
				end = this.currentPeriodPlain.add({ days: this.store.state.viewMode.value - 1 });
				break;
			case "workWeek": end = start.add({ days: 4 });
		}
		const allDays = require_generateDateRange.generateDateRange(start.toString(), end.toString());
		if (this.store.state.viewMode.unit === "month") {
			const startMonthDate = this.currentPeriodPlain.with({ day: 1 });
			const endMonthDate = this.currentPeriodPlain.add({ months: this.store.state.viewMode.value - 1 }).with({ day: _js_temporal_polyfill.Temporal.PlainDate.from(this.currentPeriodPlain.toString({ calendarName: "auto" })).daysInMonth });
			const filteredDays = allDays.filter((day) => _js_temporal_polyfill.Temporal.PlainDate.compare(day, startMonthDate) >= 0 && _js_temporal_polyfill.Temporal.PlainDate.compare(day, endMonthDate) <= 0);
			if (this.options.range.start || this.options.range.end) return filteredDays.filter((day) => require_dateRange.isDateInRange({
				date: day,
				range: this.options.range
			}));
			return filteredDays;
		}
		if (this.options.range.start || this.options.range.end) return allDays.filter((day) => require_dateRange.isDateInRange({
			date: day,
			range: this.options.range
		}));
		return allDays;
	}
	getDaysNames(weekday = "short") {
		const firstDayOfWeek = this.getFirstDayOfWeek().dayOfWeek;
		const cacheKey = `${weekday}|${firstDayOfWeek}`;
		const cached = this._dayNamesCache.get(cacheKey);
		if (cached) return cached;
		const baseDate = _js_temporal_polyfill.Temporal.PlainDate.from("2024-01-01");
		const names = Array.from({ length: 7 }).map((_, i) => baseDate.add({ days: (i + (firstDayOfWeek - 1)) % 7 }).toLocaleString(this.options.locale, { weekday }));
		this._dayNamesCache.set(cacheKey, names);
		return names;
	}
	changeViewMode(newViewMode) {
		this.store.setState((prev) => ({
			...prev,
			viewMode: newViewMode
		}));
		require_TimeClient.getTimeClient().emit("calendar:viewMode:changed", { viewMode: {
			value: newViewMode.value,
			unit: newViewMode.unit
		} });
	}
	goToPreviousPeriod() {
		let newActiveDate;
		switch (this.store.state.viewMode.unit) {
			case "month":
				newActiveDate = this.activeDatePlain.subtract({ months: this.store.state.viewMode.value });
				break;
			case "week":
				newActiveDate = this.activeDatePlain.subtract({ weeks: this.store.state.viewMode.value });
				break;
			case "day":
				newActiveDate = this.activeDatePlain.subtract({ days: this.store.state.viewMode.value });
				break;
			case "workWeek": newActiveDate = this.activeDatePlain.subtract({ days: 5 });
		}
		const constrainedDate = require_dateRange.constrainDateToRange({
			date: newActiveDate,
			range: this.options.range
		});
		this.store.setState((prev) => ({
			...prev,
			activeDate: toIsoDate(constrainedDate),
			currentPeriod: toIsoDate(constrainedDate)
		}));
		require_TimeClient.getTimeClient().emit("calendar:navigate", {
			direction: "previous",
			targetDate: constrainedDate.toString({ calendarName: "never" })
		});
	}
	goToNextPeriod() {
		let newActiveDate;
		switch (this.store.state.viewMode.unit) {
			case "month":
				newActiveDate = this.activeDatePlain.add({ months: this.store.state.viewMode.value });
				break;
			case "week":
				newActiveDate = this.activeDatePlain.add({ weeks: this.store.state.viewMode.value });
				break;
			case "day":
				newActiveDate = this.activeDatePlain.add({ days: this.store.state.viewMode.value });
				break;
			case "workWeek": newActiveDate = this.activeDatePlain.add({ days: 5 });
		}
		const constrainedDate = require_dateRange.constrainDateToRange({
			date: newActiveDate,
			range: this.options.range
		});
		this.store.setState((prev) => ({
			...prev,
			activeDate: toIsoDate(constrainedDate),
			currentPeriod: toIsoDate(constrainedDate)
		}));
		require_TimeClient.getTimeClient().emit("calendar:navigate", {
			direction: "next",
			targetDate: constrainedDate.toString({ calendarName: "never" })
		});
	}
	goToCurrentPeriod() {
		const now = _js_temporal_polyfill.Temporal.Now.zonedDateTimeISO(this.options.timeZone).toPlainDate().withCalendar(this.options.calendar);
		const constrainedDate = require_dateRange.constrainDateToRange({
			date: now,
			range: this.options.range
		});
		this.store.setState((prev) => ({
			...prev,
			activeDate: toIsoDate(constrainedDate),
			currentPeriod: toIsoDate(constrainedDate)
		}));
		require_TimeClient.getTimeClient().emit("calendar:navigate", {
			direction: "current",
			targetDate: constrainedDate.toString({ calendarName: "never" })
		});
	}
	goToSpecificPeriod(date) {
		const dateStr = toTemporalPlainDateString(date);
		const targetDate = _js_temporal_polyfill.Temporal.PlainDate.from(dateStr).withCalendar(this.options.calendar);
		const constrainedDate = require_dateRange.constrainDateToRange({
			date: targetDate,
			range: this.options.range
		});
		this.store.setState((prev) => ({
			...prev,
			activeDate: toIsoDate(constrainedDate),
			currentPeriod: toIsoDate(constrainedDate)
		}));
		require_TimeClient.getTimeClient().emit("calendar:navigate", {
			direction: "specific",
			targetDate: constrainedDate.toString({ calendarName: "never" })
		});
	}
	canGoPreviousPeriod() {
		let previousDate;
		switch (this.store.state.viewMode.unit) {
			case "month":
				previousDate = this.activeDatePlain.subtract({ months: this.store.state.viewMode.value });
				break;
			case "week":
				previousDate = this.activeDatePlain.subtract({ weeks: this.store.state.viewMode.value });
				break;
			case "day":
				previousDate = this.activeDatePlain.subtract({ days: this.store.state.viewMode.value });
				break;
			case "workWeek": previousDate = this.activeDatePlain.subtract({ days: 5 });
		}
		return require_dateRange.isDateInRange({
			date: previousDate,
			range: this.options.range
		});
	}
	canGoNextPeriod() {
		let nextDate;
		switch (this.store.state.viewMode.unit) {
			case "month":
				nextDate = this.activeDatePlain.add({ months: this.store.state.viewMode.value });
				break;
			case "week":
				nextDate = this.activeDatePlain.add({ weeks: this.store.state.viewMode.value });
				break;
			case "day":
				nextDate = this.activeDatePlain.add({ days: this.store.state.viewMode.value });
				break;
			case "workWeek": nextDate = this.activeDatePlain.add({ days: 5 });
		}
		return require_dateRange.isDateInRange({
			date: nextDate,
			range: this.options.range
		});
	}
};

//#endregion
exports.DateCore = DateCore;
//# sourceMappingURL=date-core.cjs.map