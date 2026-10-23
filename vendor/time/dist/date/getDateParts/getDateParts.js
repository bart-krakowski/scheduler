import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/date/getDateParts/getDateParts.ts
const REFERENCE_ISO_DATE = "2020-01-01";
const CACHE_LIMIT = 8192;
const formatterCache = /* @__PURE__ */ new Map();
const plainDateCache = /* @__PURE__ */ new Map();
const partsCache = /* @__PURE__ */ new Map();
function cacheSet(cache, key, value) {
	if (cache.size >= CACHE_LIMIT) {
		let dropped = 0;
		for (const staleKey of cache.keys()) {
			cache.delete(staleKey);
			if (++dropped >= CACHE_LIMIT / 2) break;
		}
	}
	cache.set(key, value);
	return value;
}
function intlCalendarId(calendarId) {
	return calendarId === "iso8601" ? "gregory" : calendarId;
}
function resolveCalendarId(calendar) {
	return Temporal.PlainDate.from(REFERENCE_ISO_DATE).withCalendar(calendar).calendarId;
}
function toIsoDateString(date, timeZone) {
	if (typeof date === "string") return date.length === 7 ? `${date}-01` : date.slice(0, 10);
	if (date instanceof Temporal.PlainDate) return date.toString({ calendarName: "never" });
	if (date instanceof Temporal.ZonedDateTime) return date.toPlainDate().toString({ calendarName: "never" });
	const epochMilliseconds = date instanceof Date ? date.getTime() : date;
	return Temporal.Instant.fromEpochMilliseconds(epochMilliseconds).toZonedDateTimeISO(timeZone).toPlainDate().toString({ calendarName: "never" });
}
function toCalendarDate(isoDate, calendarId) {
	const key = `${calendarId}|${isoDate}`;
	return plainDateCache.get(key) ?? cacheSet(plainDateCache, key, Temporal.PlainDate.from(isoDate).withCalendar(calendarId));
}
function getDateFormatter(locale, calendarId, presetKey, options) {
	const key = `${locale}|${calendarId}|${presetKey}`;
	return formatterCache.get(key) ?? cacheSet(formatterCache, key, new Intl.DateTimeFormat(locale, {
		timeZone: "UTC",
		calendar: intlCalendarId(calendarId),
		...options
	}));
}
function partsOf(formatter, date) {
	const parts = /* @__PURE__ */ new Map();
	for (const part of formatter.formatToParts(date)) {
		if (part.type === "literal") continue;
		parts.set(part.type, part.value);
	}
	return parts;
}
function buildParts(isoDate, calendarId, locale) {
	const utcDate = /* @__PURE__ */ new Date(`${isoDate}T00:00:00Z`);
	const long = partsOf(getDateFormatter(locale, calendarId, "long", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric"
	}), utcDate);
	const short = partsOf(getDateFormatter(locale, calendarId, "short", {
		weekday: "short",
		month: "short",
		day: "numeric"
	}), utcDate);
	const parts = {
		calendar: calendarId,
		dayOfMonth: partsOf(getDateFormatter(locale, calendarId, "stock", { dateStyle: "long" }), utcDate).get("day") ?? long.get("day") ?? "",
		weekdayShort: short.get("weekday") ?? "",
		weekdayLong: long.get("weekday") ?? "",
		monthShort: short.get("month") ?? "",
		monthLong: long.get("month") ?? "",
		yearLabel: long.get("year") ?? long.get("relatedYear") ?? "",
		yearName: long.get("yearName")
	};
	const calendarDate = () => toCalendarDate(isoDate, calendarId);
	Object.defineProperties(parts, {
		year: {
			enumerable: true,
			get: () => calendarDate().year
		},
		month: {
			enumerable: true,
			get: () => calendarDate().month
		},
		monthCode: {
			enumerable: true,
			get: () => calendarDate().monthCode
		},
		day: {
			enumerable: true,
			get: () => calendarDate().day
		},
		isLeapMonth: {
			enumerable: true,
			get: () => calendarDate().monthCode.endsWith("L")
		}
	});
	return parts;
}
function getDateParts(date, options) {
	const defaults = getDateTimeDefaults();
	const locale = options?.locale ?? defaults.locale;
	const calendarId = options?.calendar ?? defaults.calendar;
	const isoDate = toIsoDateString(date, options?.timeZone ?? defaults.timeZone);
	const key = `${locale}|${calendarId}|${isoDate}`;
	return partsCache.get(key) ?? cacheSet(partsCache, key, buildParts(isoDate, calendarId, locale));
}

//#endregion
export { getDateFormatter, getDateParts, resolveCalendarId, toCalendarDate, toIsoDateString };
//# sourceMappingURL=getDateParts.js.map