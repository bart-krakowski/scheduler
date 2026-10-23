const require_parse = require('../date/parse/parse.cjs');
const require_getDateParts = require('../date/getDateParts/getDateParts.cjs');
const require_bucketByDay = require('../projection/bucketByDay.cjs');
const require_generateDateRange = require('./generateDateRange.cjs');
const require_groupDaysBy = require('./groupDaysBy.cjs');
const require_getTimeAxisLabels = require('./getTimeAxisLabels.cjs');
const require_TimeClient = require('../client/TimeClient.cjs');
const require_materialize = require('../recurrence/materialize.cjs');
const require_kernel = require('../kernel/kernel.cjs');
const require_registry = require('./features/registry.cjs');
const require_date_core = require('./date-core.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/calendar/calendar.ts
var CalendarCore = class CalendarCore extends require_date_core.DateCore {
	get _api() {
		return this._features;
	}
	get featureApi() {
		return this._features;
	}
	hasFeature(name) {
		return this._featureNames.has(name);
	}
	_describeMissingFeatureApi(key) {
		const featureName = require_registry.FEATURE_API_OWNERS[key] ?? "a feature";
		return `CalendarCore: "${key}" requires ${featureName}. Compose it via calendarFeatures([${featureName}, ...]).`;
	}
	_bumpMapVersion() {
		this._mapVersion++;
	}
	constructor(options) {
		super(options);
		this._eventMap = /* @__PURE__ */ new Map();
		this._dependentsMap = /* @__PURE__ */ new Map();
		this._dateIndex = /* @__PURE__ */ new Map();
		this._loadedRanges = [];
		this._inFlightFetches = 0;
		this._featureNames = /* @__PURE__ */ new Set();
		this._eventsCache = null;
		this._mapVersion = 0;
		this._eventMapCache = /* @__PURE__ */ new Map();
		this._eventMapCacheVersion = -1;
		Object.assign(this.options, {
			resources: options.resources || null,
			calendars: options.calendars || null,
			defaultCalendarId: options.defaultCalendarId,
			multiResource: options.multiResource,
			fetchEvents: options.fetchEvents,
			features: options.features
		});
		const seed = options.events?.map((e) => this.normalizeEvent(e)) ?? [];
		this._seedKernel(seed);
		Object.defineProperty(this.options, "events", {
			get: () => this._eventsView(),
			set: (next) => this.setEvents(next),
			enumerable: true,
			configurable: true
		});
		seed.forEach((e) => this._indexAddEvent(e));
	}
	_load(events) {
		this._kernel.load(events);
		this._eventsCache = null;
	}
	_eventsView() {
		this._eventsCache ??= this._kernel.getEvents();
		return this._eventsCache;
	}
	_seedKernel(events) {
		this._eventsCache = null;
		const features = this.options.features.map((factory) => factory());
		this._featureNames = new Set(features.map((feature) => feature.name));
		const ctx = {
			timeZone: this.options.timeZone,
			getResources: () => this.options.resources ?? [],
			getWorkingTime: () => this._workingTime()
		};
		const modules = {};
		for (const feature of features) {
			const module = feature.module?.(ctx);
			if (module) modules[feature.name] = module;
		}
		this._assertFeatureRequires(features);
		this._kernel = require_kernel.createKernel({
			events,
			modules
		});
		const host = this._host();
		const api = {};
		const byFeature = {};
		const peers = new Proxy(byFeature, { get: (target, key) => target[key] });
		for (const feature of features) {
			const contributed = feature.api?.(host, this._kernel.api, peers);
			if (!contributed) continue;
			byFeature[feature.name] = contributed;
			for (const [key, value] of Object.entries(contributed)) {
				if (key in api) throw new Error(`CalendarCore: feature "${feature.name}" contributes api "${key}", which another composed feature already contributes. Compose only one of them.`);
				if (key in CalendarCore.prototype) throw new Error(`CalendarCore: feature "${feature.name}" contributes api "${key}", which shadows a core method. Rename it.`);
				api[key] = value;
			}
		}
		this._features = api;
		this._mountFeatureApi(api);
	}
	_mountFeatureApi(api) {
		Object.assign(this, api);
		for (const key of Object.keys(require_registry.FEATURE_API_OWNERS)) {
			if (key in api) continue;
			Object.defineProperty(this, key, {
				get: () => {
					throw new Error(this._describeMissingFeatureApi(key));
				},
				configurable: true
			});
		}
	}
	_assertFeatureRequires(features) {
		const mounted = new Set(features.map((feature) => feature.name));
		for (const feature of features) for (const required of feature.requires ?? []) {
			if (mounted.has(required)) continue;
			throw new Error(`CalendarCore: feature "${feature.name}" requires "${required}", which is not composed. Add it to the features option.`);
		}
	}
	get _availability() {
		return this.hasFeature("availability") ? this._api : null;
	}
	get _dependency() {
		return this.hasFeature("dependency") ? this._api : null;
	}
	get _constraint() {
		return this.hasFeature("constraint") ? this._api : null;
	}
	_checkAvailability(event, newStart, newEnd, newResources, newConsumption) {
		return this._availability?.checkEventAvailability(event, newStart, newEnd, newResources, newConsumption) ?? null;
	}
	_checkConstraint(event, newStart, newEnd) {
		return this._constraint?.checkEventConstraint(event, newStart, newEnd) ?? null;
	}
	get _duration() {
		return this.hasFeature("duration") ? this._api : null;
	}
	_checkDuration(event, newStart, newEnd, newResources) {
		return this._duration?.checkEventDuration(event, newStart, newEnd, newResources)[0] ?? null;
	}
	_neighbourBlock(event, newStart, newEnd, unavailableMessage) {
		if (this._checkAvailability(event, newStart, newEnd)) return {
			blocked: true,
			blockedEventTitle: event.title,
			message: unavailableMessage
		};
		const rule = this._checkConstraint(event, newStart, newEnd) ?? this._checkDuration(event, newStart, newEnd);
		if (rule) return {
			blocked: true,
			blockedEventTitle: event.title,
			message: rule.message
		};
		return null;
	}
	_workingTime() {
		return {
			calendars: this.options.calendars,
			defaultCalendarId: this.options.defaultCalendarId,
			multiResource: this.options.multiResource
		};
	}
	_host() {
		return {
			getEvent: (id) => this._eventMap.get(id),
			getEvents: () => this.getEvents(),
			getState: () => this.store.state,
			getOptions: () => ({
				timeZone: this.options.timeZone,
				resources: this.options.resources,
				workingTime: this._workingTime(),
				slotRules: this.options.slotRules ?? null,
				layout: this.options.layout
			}),
			getEventMap: (window) => this.getEventMap(window),
			getDaysWithEvents: () => this.getDaysWithEvents(),
			getEventsByDate: (date) => this.getEventsByDate(date),
			invalidateEvents: () => this._invalidateEvents(),
			goToSpecificPeriod: (isoDate) => this.goToSpecificPeriod(isoDate),
			write: (ops, reason) => this._write(ops, reason),
			writeChecked: (ops, reason) => this._writeChecked(ops, reason),
			getLoadedRanges: () => this.options.fetchEvents ? this.getLoadedRanges() : null,
			fetchEventsForRange: (start, end) => this.fetchEventsForRange(start, end),
			editEvent: (eventId, updates, options) => this.editEvent(eventId, updates, options),
			removeEvent: (id) => this.removeEvent(id),
			commitUpdate: (id, updates) => this.commitUpdate(id, updates),
			validateMove: (eventId, newStart, newEnd, resources, consumption) => this.validateMove(eventId, newStart, newEnd, resources, consumption),
			validateEventDependencies: (event, dependsOn) => this._api.validateEventDependencies(event, dependsOn),
			validateEventPlacement: (event) => this._availability?.validateEventPlacement(event) ?? { blocked: false }
		};
	}
	_write(ops, reason) {
		return this._writeChecked(ops, reason).committed;
	}
	_writeChecked(ops, reason) {
		const result = this._kernel.write(ops, reason);
		if (result.status !== "committed") return {
			committed: [],
			conflicts: result.conflicts
		};
		const committed = result.batch.ops;
		this._applyOps(committed);
		return {
			committed,
			conflicts: []
		};
	}
	_conflictError(event, conflicts) {
		const [first] = conflicts;
		return {
			eventId: event.id,
			eventTitle: event.title,
			reason: "blocked",
			message: first?.message ?? `"${event.title}" was rejected on write.`,
			originalStart: event.start,
			originalEnd: event.end
		};
	}
	_eventDateKey(event) {
		const startStr = event.start;
		return startStr.split("T")[0] ?? startStr;
	}
	_indexAddEvent(event) {
		this._bumpMapVersion();
		this._eventMap.set(event.id, event);
		const dk = this._eventDateKey(event);
		if (!this._dateIndex.has(dk)) this._dateIndex.set(dk, /* @__PURE__ */ new Set());
		this._dateIndex.get(dk).add(event.id);
		for (const dep of event.dependsOn ?? []) {
			if (!this._dependentsMap.has(dep.id)) this._dependentsMap.set(dep.id, /* @__PURE__ */ new Set());
			this._dependentsMap.get(dep.id).add(event.id);
		}
	}
	_indexRemoveEvent(event) {
		this._bumpMapVersion();
		this._eventMap.delete(event.id);
		const dk = this._eventDateKey(event);
		const bucket = this._dateIndex.get(dk);
		if (bucket) {
			bucket.delete(event.id);
			if (bucket.size === 0) this._dateIndex.delete(dk);
		}
		for (const dep of event.dependsOn ?? []) this._dependentsMap.get(dep.id)?.delete(event.id);
		this._dependentsMap.delete(event.id);
	}
	_indexUpdateEvent(prev, next) {
		this._bumpMapVersion();
		this._eventMap.set(next.id, next);
		const prevDk = this._eventDateKey(prev);
		const nextDk = this._eventDateKey(next);
		if (prevDk !== nextDk) {
			const old = this._dateIndex.get(prevDk);
			if (old) {
				old.delete(prev.id);
				if (old.size === 0) this._dateIndex.delete(prevDk);
			}
			if (!this._dateIndex.has(nextDk)) this._dateIndex.set(nextDk, /* @__PURE__ */ new Set());
			this._dateIndex.get(nextDk).add(next.id);
		}
		const prevDeps = new Map((prev.dependsOn ?? []).map((d) => [d.id, d.type]));
		const nextDeps = new Map((next.dependsOn ?? []).map((d) => [d.id, d.type]));
		for (const [predId] of prevDeps) if (!nextDeps.has(predId)) this._dependentsMap.get(predId)?.delete(next.id);
		for (const [predId] of nextDeps) if (!prevDeps.has(predId)) {
			if (!this._dependentsMap.has(predId)) this._dependentsMap.set(predId, /* @__PURE__ */ new Set());
			this._dependentsMap.get(predId).add(next.id);
		}
	}
	_isRangeLoaded(start, end) {
		for (const r of this._loadedRanges) if (r.start <= start && r.end >= end) return true;
		return false;
	}
	_markRangeLoaded(start, end) {
		this._loadedRanges.push({
			start,
			end
		});
		this._loadedRanges.sort((a, b) => a.start < b.start ? -1 : 1);
		const merged = [];
		for (const r of this._loadedRanges) {
			const last = merged[merged.length - 1];
			if (last && r.start <= last.end) last.end = last.end > r.end ? last.end : r.end;
			else merged.push({ ...r });
		}
		this._loadedRanges = merged;
	}
	normalizeEvent(event) {
		const recurrence = event.recurrence;
		return {
			...event,
			start: require_parse.toPlainDateTimeString(event.start),
			end: require_parse.toPlainDateTimeString(event.end),
			...recurrence ? { recurrence: this._normalizeRecurrenceDateTimeInputs(recurrence) } : {}
		};
	}
	getCalendarDays() {
		return super.getCalendarDays();
	}
	getEventMap(window) {
		let windowStart;
		let windowEnd;
		if (window) {
			windowStart = window.start;
			windowEnd = window.end;
		} else {
			const calendarDays = this.getCalendarDays();
			windowStart = calendarDays.length > 0 ? calendarDays[0].toString({ calendarName: "never" }) : null;
			windowEnd = calendarDays.length > 0 ? calendarDays[calendarDays.length - 1].add({ days: 1 }).toString({ calendarName: "never" }) : null;
		}
		if (this._eventMapCacheVersion !== this._mapVersion) {
			this._eventMapCache.clear();
			this._eventMapCacheVersion = this._mapVersion;
		}
		const cacheKey = `${windowStart ?? ""}|${windowEnd ?? ""}`;
		const cached = this._eventMapCache.get(cacheKey);
		if (cached) return cached;
		const projected = windowStart && windowEnd ? this._kernel.project({
			start: `${windowStart.slice(0, 10)}T00:00:00`,
			end: `${_js_temporal_polyfill.Temporal.PlainDate.from(windowEnd.slice(0, 10)).subtract({ days: 1 }).toString({ calendarName: "never" })}T23:59:59`
		}) : this._kernel.getEvents();
		const map = require_bucketByDay.bucketByDay(projected, this.options.timeZone);
		this._eventMapCache.set(cacheKey, map);
		return map;
	}
	_beginFetch() {
		this._inFlightFetches++;
		if (this._inFlightFetches === 1) this.store.setState((prev) => ({
			...prev,
			isPending: true
		}));
	}
	_endFetch(eventsChanged) {
		this._inFlightFetches = Math.max(0, this._inFlightFetches - 1);
		const isPending = this._inFlightFetches > 0;
		this.store.setState((prev) => ({
			...prev,
			isPending,
			eventsVersion: eventsChanged ? prev.eventsVersion + 1 : prev.eventsVersion
		}));
	}
	_indexFetchedEvents(fetchedEvents) {
		const newlyFetchedEvents = [];
		const loaded = [];
		for (const raw of fetchedEvents) {
			if (this._eventMap.has(raw.id)) continue;
			const normalized = this.normalizeEvent(raw);
			loaded.push(normalized);
			this._indexAddEvent(normalized);
			newlyFetchedEvents.push({
				eventId: normalized.id,
				eventTitle: normalized.title,
				start: normalized.start,
				end: normalized.end
			});
		}
		if (newlyFetchedEvents.length > 0) {
			this._load(loaded);
			require_TimeClient.getTimeClient().emit("events:set", { events: newlyFetchedEvents });
		}
	}
	async _loadRange(start, end) {
		const fetchEvents = this.options.fetchEvents;
		if (!fetchEvents) return;
		if (this._isRangeLoaded(start, end)) return;
		this._markRangeLoaded(start, end);
		this._beginFetch();
		try {
			const fetchedEvents = await fetchEvents({
				start,
				end
			});
			if (fetchedEvents.length > 0) this._indexFetchedEvents(fetchedEvents);
			this._endFetch(fetchedEvents.length > 0);
		} catch {
			this._loadedRanges = this._loadedRanges.filter((r) => !(r.start === start && r.end === end));
			this._endFetch(false);
		}
	}
	ensureRangeLoaded() {
		const calendarDays = this.getCalendarDays();
		if (!this.options.fetchEvents || calendarDays.length === 0) return;
		const first = calendarDays[0];
		const last = calendarDays[calendarDays.length - 1];
		const rangeStart = first.toString({ calendarName: "never" });
		const rangeEnd = last.add({ days: 1 }).toString({ calendarName: "never" });
		this._loadRange(rangeStart, rangeEnd);
	}
	getDaysWithEvents() {
		return this._buildDays(this.getCalendarDays());
	}
	getDaysInRange(start, end) {
		const days = require_generateDateRange.generateDateRange(start, end);
		const windowEnd = _js_temporal_polyfill.Temporal.PlainDate.from(end).add({ days: 1 }).toString({ calendarName: "never" });
		return this._buildDays(days, {
			start,
			end: windowEnd
		});
	}
	_buildDays(days, window) {
		const eventMap = this.getEventMap(window);
		const currentMonthRange = Array.from({ length: this.store.state.viewMode.value }, (_, i) => this.currentPeriodPlain.add({ months: i }).month);
		const today = _js_temporal_polyfill.Temporal.Now.plainDateISO();
		return days.map((day) => {
			const isoDate = day.toString({ calendarName: "never" });
			const dailyEvents = eventMap.get(isoDate) ?? [];
			const timedEvents = [];
			const allDayEvents = [];
			for (const ev of dailyEvents) if (ev.allDay) allDayEvents.push(ev);
			else timedEvents.push(ev);
			const isInCurrentPeriod = currentMonthRange.includes(day.month);
			return {
				isoDate,
				isoMonth: isoDate.slice(0, 7),
				dayOfMonth: require_getDateParts.toCalendarDate(isoDate, this.calendarId).day,
				events: timedEvents,
				allDayEvents,
				isToday: _js_temporal_polyfill.Temporal.PlainDate.compare(day, today) === 0,
				isInCurrentPeriod
			};
		});
	}
	getLoadedRanges() {
		return this._loadedRanges;
	}
	async fetchEventsForRange(start, end) {
		await this._loadRange(start, end);
	}
	formatPeriodLabel(options) {
		const days = this.getDaysWithEvents();
		if (days.length === 0) return "";
		const first = days[0];
		const last = days[days.length - 1];
		const fmt = (isoDate) => this.formatPeriod(isoDate, {
			unit: "day",
			locale: options?.locale
		});
		if (days.length === 1) return fmt(first.isoDate);
		return `${fmt(first.isoDate)} \u2014 ${fmt(last.isoDate)}`;
	}
	formatCurrentPeriod(options) {
		return this.formatPeriod(void 0, {
			unit: "month",
			locale: options?.locale
		});
	}
	groupDaysBy({ days, unit, fillMissingDays = true }) {
		return require_groupDaysBy.groupDaysBy({
			days,
			unit,
			fillMissingDays,
			weekStartsOn: this.getWeekStartsOn(),
			locale: this.options.locale,
			calendar: this.calendarId
		});
	}
	getTimeAxisLabels(options) {
		return require_getTimeAxisLabels.getTimeAxisLabels(this.options.locale, options);
	}
	getTimeSlots(options) {
		return this.getTimeAxisLabels(options);
	}
	getEventsByDate(date) {
		const targetDate = _js_temporal_polyfill.Temporal.PlainDate.from(date).toString({ calendarName: "never" });
		const windowEnd = _js_temporal_polyfill.Temporal.PlainDate.from(targetDate).add({ days: 1 }).toString({ calendarName: "never" });
		const all = this.getEventMap({
			start: targetDate,
			end: windowEnd
		}).get(targetDate);
		return all ? [...all] : [];
	}
	getAllDayEventsByDate(date) {
		const targetDate = _js_temporal_polyfill.Temporal.PlainDate.from(date).toString({ calendarName: "never" });
		const windowEnd = _js_temporal_polyfill.Temporal.PlainDate.from(targetDate).add({ days: 1 }).toString({ calendarName: "never" });
		return (this.getEventMap({
			start: targetDate,
			end: windowEnd
		}).get(targetDate) ?? []).filter((e) => !!e.allDay);
	}
	_applyOps(ops) {
		this._eventsCache = null;
		for (const op of ops) {
			if (op.kind === "add") {
				this._indexAddEvent(op.event);
				continue;
			}
			if (op.kind === "remove") {
				const current = this._eventMap.get(op.id);
				if (!current) continue;
				this._indexRemoveEvent(current);
				continue;
			}
			const current = this._eventMap.get(op.id);
			if (!current) continue;
			this._indexUpdateEvent(current, op.after);
		}
		this._invalidateEvents();
	}
	_invalidateEvents() {
		this._bumpMapVersion();
		this.store.setState((prev) => ({
			...prev,
			eventsVersion: prev.eventsVersion + 1
		}));
	}
	commitAdd(event) {
		this._commitAdd(event);
	}
	_commitAdd(event) {
		const normalized = this.normalizeEvent(event);
		const { committed, conflicts } = this._writeChecked([{
			kind: "add",
			event: normalized
		}], "add");
		if (committed.length === 0) return conflicts;
		require_TimeClient.getTimeClient().emit("event:added", {
			eventId: normalized.id,
			eventTitle: normalized.title,
			start: normalized.start,
			end: normalized.end
		});
		return [];
	}
	commitUpdate(id, updates) {
		this._commitUpdate(id, updates);
	}
	_commitUpdate(id, updates) {
		const existingEvent = this._eventMap.get(id);
		if (!existingEvent) return [];
		const recurrenceUpdate = updates.recurrence;
		const normalizedUpdates = {
			...updates,
			...updates.start != null ? { start: require_parse.toPlainDateTimeString(updates.start) } : {},
			...updates.end != null ? { end: require_parse.toPlainDateTimeString(updates.end) } : {},
			...recurrenceUpdate != null ? { recurrence: this._normalizeRecurrenceDateTimeInputs(recurrenceUpdate) } : {}
		};
		const nextEvent = {
			...existingEvent,
			...normalizedUpdates
		};
		const { committed, conflicts } = this._writeChecked([{
			kind: "update",
			id,
			before: existingEvent,
			after: nextEvent
		}], "update");
		if (committed.length === 0) return conflicts;
		for (const op of committed) {
			if (op.kind !== "update" || op.id === id) continue;
			require_TimeClient.getTimeClient().emit("event:updated", {
				eventId: op.id,
				eventTitle: op.before.title,
				start: op.after.start,
				end: op.after.end,
				updates: {
					start: op.after.start,
					end: op.after.end
				}
			});
		}
		require_TimeClient.getTimeClient().emit("event:updated", {
			eventId: id,
			eventTitle: existingEvent.title,
			start: require_parse.toPlainDateTimeString(nextEvent.start),
			end: require_parse.toPlainDateTimeString(nextEvent.end),
			updates: normalizedUpdates
		});
		return [];
	}
	getEvents() {
		return [...this._eventsView()];
	}
	_normalizeRecurrenceDateTimeInputs(rule) {
		return require_materialize.normalizeRecurrenceRule(rule);
	}
	validateMove(eventId, newStart, newEnd, newResources, newConsumption) {
		const event = this._eventMap.get(eventId);
		if (!event || event._originalStart) return { blocked: false };
		const tz = this.options.timeZone;
		const newStartMs = _js_temporal_polyfill.Temporal.PlainDateTime.from(newStart).toZonedDateTime(tz).epochMilliseconds;
		const newEndMs = _js_temporal_polyfill.Temporal.PlainDateTime.from(newEnd).toZonedDateTime(tz).epochMilliseconds;
		const [anchored] = this._dependency?.getAnchorConflicts(eventId, newStart, newEnd) ?? [];
		if (anchored) return {
			blocked: true,
			blockedEventTitle: anchored.eventTitle,
			message: anchored.message
		};
		const rule = this._checkConstraint(event, newStart, newEnd) ?? this._checkDuration(event, newStart, newEnd, newResources);
		if (rule) return {
			blocked: true,
			blockedEventTitle: event.title,
			message: rule.message
		};
		if (event.dependsOn?.length) {
			const pulled = this._dependency?.getPredecessorShifts(eventId, newStart, newEnd) ?? [];
			for (const shift of pulled) {
				const blocked = this._neighbourBlock(shift.event, shift.newStart, shift.newEnd, `"${shift.event.title}" would be pulled into unavailable time.`);
				if (blocked) return blocked;
			}
		}
		const conflict = this._checkAvailability(event, newStart, newEnd, newResources, newConsumption);
		if (conflict) {
			const message = conflict.resourceDetails.some((d) => d.reason === "capacity") ? `"${event.title}" cannot be placed here — ${conflict.description}.` : `"${event.title}" cannot be placed here — it falls inside an unavailable zone.`;
			return {
				blocked: true,
				blockedEventTitle: event.title,
				message
			};
		}
		const startDeltaMs = newStartMs - _js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(event.start)).toZonedDateTime(tz).epochMilliseconds;
		if (startDeltaMs !== 0) {
			const affected = this._dependency?.getAffectedByDelta(eventId, startDeltaMs) ?? [];
			for (const { event: dep, newStart: depStart, newEnd: depEnd } of affected) {
				const blocked = this._neighbourBlock(dep, depStart, depEnd, `"${dep.title}" would be pushed to unavailable time.`);
				if (blocked) return blocked;
			}
		}
		if (newEndMs - _js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(event.end)).toZonedDateTime(tz).epochMilliseconds > 0) {
			const pushed = this._dependency?.getDependentShifts(eventId, newStart, newEnd) ?? [];
			for (const shift of pushed) {
				const blocked = this._neighbourBlock(shift.event, shift.newStart, shift.newEnd, `"${shift.event.title}" would be pushed into unavailable time.`);
				if (blocked) return blocked;
			}
		}
		return { blocked: false };
	}
	async addEvent(event, options) {
		const dependsOn = options?.dependsOn;
		const startStr = event.start;
		const endStr = event.end;
		const startDateStr = startStr.slice(0, 10);
		const endDateStr = _js_temporal_polyfill.Temporal.PlainDate.from(endStr.slice(0, 10)).add({ days: 1 }).toString({ calendarName: "never" });
		await this.fetchEventsForRange(startDateStr, endDateStr);
		if (dependsOn && dependsOn.length > 0) {
			const depValidation = this._api.validateEventDependencies({
				id: event.id,
				title: event.title,
				start: startStr,
				end: endStr
			}, dependsOn);
			if (!depValidation.valid && depValidation.error) return {
				success: false,
				error: depValidation.error
			};
		}
		const placementValidation = this._availability?.validateEventPlacement({
			id: event.id,
			title: event.title,
			start: startStr,
			end: endStr,
			resources: event.resources,
			consumption: event.consumption
		});
		if (placementValidation?.blocked) return {
			success: false,
			error: {
				eventId: event.id,
				eventTitle: event.title,
				reason: "blocked",
				message: placementValidation.message ?? `Cannot place "${event.title}" here.`,
				originalStart: startStr,
				originalEnd: endStr
			}
		};
		const addConflicts = this._commitAdd(event);
		if (addConflicts.length > 0) return {
			success: false,
			error: this._conflictError({
				id: event.id,
				title: event.title,
				start: startStr,
				end: endStr
			}, addConflicts)
		};
		return { success: true };
	}
	async editEvent(eventId, updates, options) {
		const dependsOn = options?.dependsOn;
		const existingEvent = this._eventMap.get(eventId);
		if (!existingEvent) return {
			success: false,
			error: {
				eventId,
				eventTitle: "",
				reason: "blocked",
				message: `Event "${eventId}" not found.`,
				originalStart: "",
				originalEnd: ""
			}
		};
		const effectiveStart = updates.start ?? existingEvent.start;
		const effectiveEnd = updates.end ?? existingEvent.end;
		const oldStartDateStr = existingEvent.start.slice(0, 10);
		const newStartDateStr = effectiveStart.slice(0, 10);
		const rangeStart = oldStartDateStr < newStartDateStr ? oldStartDateStr : newStartDateStr;
		const oldEndDate = _js_temporal_polyfill.Temporal.PlainDate.from(existingEvent.end.slice(0, 10)).add({ days: 1 });
		const newEndDate = _js_temporal_polyfill.Temporal.PlainDate.from(effectiveEnd.slice(0, 10)).add({ days: 1 });
		const rangeEnd = (_js_temporal_polyfill.Temporal.PlainDate.compare(oldEndDate, newEndDate) > 0 ? oldEndDate : newEndDate).toString({ calendarName: "never" });
		await this.fetchEventsForRange(rangeStart, rangeEnd);
		if (dependsOn && dependsOn.length > 0) {
			const depValidation = this._api.validateEventDependencies({
				id: eventId,
				title: updates.title ?? existingEvent.title,
				start: effectiveStart,
				end: effectiveEnd
			}, dependsOn);
			if (!depValidation.valid && depValidation.error) return {
				success: false,
				error: depValidation.error
			};
		}
		const startChanged = updates.start !== void 0;
		const endChanged = updates.end !== void 0;
		const resourcesChanged = updates.resources !== void 0;
		const consumptionChanged = updates.consumption !== void 0;
		if (startChanged || endChanged || resourcesChanged || consumptionChanged) {
			const resources = updates.resources ?? existingEvent.resources;
			const consumption = updates.consumption ?? existingEvent.consumption;
			const moveValidation = this.validateMove(eventId, effectiveStart, effectiveEnd, resources, consumption);
			if (moveValidation.blocked) return {
				success: false,
				error: {
					eventId,
					eventTitle: moveValidation.blockedEventTitle ?? existingEvent.title,
					reason: "blocked",
					message: moveValidation.message ?? `Cannot move "${existingEvent.title}" to this position.`,
					originalStart: existingEvent.start,
					originalEnd: existingEvent.end,
					attemptedStart: effectiveStart,
					attemptedEnd: effectiveEnd
				}
			};
		}
		const updateConflicts = this._commitUpdate(eventId, updates);
		if (updateConflicts.length > 0) return {
			success: false,
			error: this._conflictError({
				id: eventId,
				title: existingEvent.title,
				start: effectiveStart,
				end: effectiveEnd
			}, updateConflicts)
		};
		return { success: true };
	}
	removeEvent(id) {
		const removedEvent = this._eventMap.get(id);
		if (!removedEvent) return;
		this._write([{
			kind: "remove",
			id,
			event: removedEvent
		}], "remove");
		require_TimeClient.getTimeClient().emit("event:removed", {
			eventId: id,
			eventTitle: removedEvent.title,
			start: removedEvent.start,
			end: removedEvent.end
		});
	}
	setResources(resources) {
		this.options.resources = resources;
		this._invalidateEvents();
	}
	setEvents(events) {
		const next = events?.map((e) => this.normalizeEvent(e)) ?? [];
		this._eventMap.clear();
		this._dependentsMap.clear();
		this._dateIndex.clear();
		this._seedKernel(next);
		next.forEach((e) => this._indexAddEvent(e));
		this._invalidateEvents();
	}
};
function createCalendar(options) {
	return new CalendarCore(options);
}

//#endregion
exports.CalendarCore = CalendarCore;
exports.DateCore = require_date_core.DateCore;
exports.createCalendar = createCalendar;
//# sourceMappingURL=calendar.cjs.map