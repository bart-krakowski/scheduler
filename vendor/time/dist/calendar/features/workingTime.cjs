const require_parse = require('../../date/parse/parse.cjs');
const require_minutes = require('../../workingTime/minutes.cjs');
const require_resolve = require('../../workingTime/resolve.cjs');

//#region src/calendar/features/workingTime.ts
function workingTimeFeature() {
	const minuteCache = /* @__PURE__ */ new Map();
	let cachedForResources = null;
	let cachedForCalendars = void 0;
	const resourcesOf = (host) => {
		const { resources, workingTime } = host.getOptions();
		if (resources !== cachedForResources || workingTime.calendars !== cachedForCalendars) {
			minuteCache.clear();
			cachedForResources = resources;
			cachedForCalendars = workingTime.calendars;
		}
		return resources ?? [];
	};
	const targetResourceIds = (target) => {
		if (target?.resourceIds) return target.resourceIds;
		return target?.resourceId != null ? [target.resourceId] : void 0;
	};
	const layersOf = (host, target) => {
		const resources = resourcesOf(host);
		const { workingTime } = host.getOptions();
		const ids = targetResourceIds(target);
		return (ids ? resources.filter((resource) => ids.includes(resource.id)).map((resource) => resource.calendarId ?? workingTime.defaultCalendarId) : [workingTime.defaultCalendarId]).map((base) => [base, target?.calendarId]);
	};
	const workingMinutes = (host, date, target) => {
		const layers = layersOf(host, target);
		const key = `${layers.map((stack) => stack.join(">")).sort().join("|")}@${date}`;
		const cached = minuteCache.get(key);
		if (cached) return cached;
		const { workingTime } = host.getOptions();
		const merged = require_minutes.mergeMinuteRanges(layers.flatMap((stack) => require_resolve.resolveLayeredDayMinutes(stack, date, workingTime.calendars)));
		minuteCache.set(key, merged);
		return merged;
	};
	return {
		name: "workingTime",
		api: (host) => ({
			getEffectiveCalendar: (target) => {
				const { workingTime } = host.getOptions();
				if (target?.calendarId) return target.calendarId;
				const id = target?.resourceId ?? target?.resourceIds?.[0];
				return (id != null ? resourcesOf(host).find((candidate) => candidate.id === id) : void 0)?.calendarId ?? workingTime.defaultCalendarId;
			},
			getWorkingMinutes: (date, target) => workingMinutes(host, date, target),
			getNonWorkingMinutes: (date, target) => require_minutes.invertMinuteRanges(workingMinutes(host, date, target)),
			getWorkingIntervals: (range, target) => require_resolve.getLayeredWorkingTime(layersOf(host, target), {
				start: require_parse.toPlainDateTimeString(range.start),
				end: require_parse.toPlainDateTimeString(range.end)
			}, host.getOptions().workingTime.calendars),
			isWorkingTime: (range, target) => {
				const start = require_parse.toPlainDateTimeString(range.start);
				const end = require_parse.toPlainDateTimeString(range.end);
				if (end <= start) return false;
				const [covering, ...rest] = require_resolve.getLayeredWorkingTime(layersOf(host, target), {
					start,
					end
				}, host.getOptions().workingTime.calendars);
				return rest.length === 0 && covering !== void 0 && covering.start === start && covering.end === end;
			}
		})
	};
}

//#endregion
exports.workingTimeFeature = workingTimeFeature;
//# sourceMappingURL=workingTime.cjs.map