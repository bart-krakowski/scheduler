const require_minutes = require('../workingTime/minutes.cjs');
const require_resolve = require('../workingTime/resolve.cjs');
const require_skew = require('../workingTime/skew.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/slots/generateSlots.ts
const DEFAULT_MAX_SLOTS = 5e3;
const MS_PER_MINUTE = 6e4;
const MS_PER_DAY = 864e5;
function minutesOfDay(value) {
	return value.length < 16 ? 0 : require_minutes.parseHmToMinutes(value.slice(11, 16));
}
function civilMinutes(value) {
	const year = +value.slice(0, 4);
	const month = +value.slice(5, 7);
	const day = +value.slice(8, 10);
	return Date.UTC(year, month - 1, day) / MS_PER_MINUTE + minutesOfDay(value);
}
function civilStamp(totalMinutes) {
	const dayIndex = Math.floor(totalMinutes / require_minutes.MINUTES_IN_DAY);
	const withinDay = totalMinutes - dayIndex * require_minutes.MINUTES_IN_DAY;
	return `${(/* @__PURE__ */ new Date(dayIndex * MS_PER_DAY)).toISOString().slice(0, 10)}T${require_minutes.formatMinutesToTime(withinDay)}:00`;
}
function openingScanStart(lowerBound) {
	return lowerBound - lowerBound % require_minutes.MINUTES_IN_DAY - require_minutes.MINUTES_IN_DAY;
}
function sum(values) {
	return values.reduce((total, value) => total + value, 0);
}
function resolveSlotInstants(civil, timeZone) {
	const plain = _js_temporal_polyfill.Temporal.PlainDateTime.from(civil);
	const earlier = plain.toZonedDateTime(timeZone, { disambiguation: "earlier" });
	if (!earlier.toPlainDateTime().equals(plain)) return [];
	const later = plain.toZonedDateTime(timeZone, { disambiguation: "later" });
	return earlier.epochMilliseconds === later.epochMilliseconds ? [earlier.epochMilliseconds] : [earlier.epochMilliseconds, later.epochMilliseconds];
}
function toOccupants(events, now) {
	const nowMinutes = civilMinutes(now);
	return events.filter((event) => event.expiresAt === void 0 || civilMinutes(event.expiresAt) > nowMinutes).map((event) => ({
		startMinutes: civilMinutes(event.start),
		endMinutes: civilMinutes(event.end),
		resourceIds: event.resourceIds ?? [],
		consumption: sum(event.consumption ?? [1])
	}));
}
function reservedOverlap(slotStart, slotEnd, occupant, before, after) {
	return slotStart - before < occupant.endMinutes + after && slotEnd + after > occupant.startMinutes - before;
}
function lowerBoundFor(rule, input, layers) {
	const rangeStart = civilMinutes(input.range.start);
	const nowMinutes = civilMinutes(input.now);
	if (!rule.minNotice) return Math.max(rangeStart, nowMinutes);
	const earliest = rule.minNoticeIsWorkingTime ? require_skew.addWorkingMinutes(input.now, rule.minNotice, layers, input.calendars) : civilStamp(nowMinutes + rule.minNotice);
	return Math.max(rangeStart, earliest === null ? Infinity : civilMinutes(earliest));
}
function upperBoundFor(rule, input) {
	const rangeEnd = civilMinutes(input.range.end);
	if (rule.maxHorizon === void 0) return rangeEnd;
	const startOfToday = civilMinutes(`${input.now.slice(0, 10)}T00:00:00`);
	return Math.min(rangeEnd, startOfToday + (rule.maxHorizon + 1) * require_minutes.MINUTES_IN_DAY);
}
function candidatesFor(rule, resources) {
	if (!rule.resourceIds) return null;
	return rule.resourceIds.map((id) => resources.find((resource) => resource.id === id) ?? { id });
}
function occupancyFor(rule, candidates, occupants, slotStart, slotEnd) {
	if (candidates === null) {
		const before = rule.bufferBefore ?? 0;
		const after = rule.bufferAfter ?? 0;
		const capacity = rule.capacity ?? 1;
		const used = occupants.filter((occupant) => reservedOverlap(slotStart, slotEnd, occupant, before, after)).reduce((total, occupant) => total + occupant.consumption, 0);
		return used >= capacity ? null : {
			availableResourceIds: [],
			remainingCapacity: capacity - used
		};
	}
	const availableResourceIds = [];
	let remainingCapacity = 0;
	for (const resource of candidates) {
		const before = Math.max(rule.bufferBefore ?? 0, resource.buffer?.before ?? 0);
		const after = Math.max(rule.bufferAfter ?? 0, resource.buffer?.after ?? 0);
		const capacity = sum(resource.capacity ?? [1]);
		const used = occupants.filter((occupant) => occupant.resourceIds.includes(resource.id)).filter((occupant) => reservedOverlap(slotStart, slotEnd, occupant, before, after)).reduce((total, occupant) => total + occupant.consumption, 0);
		if (used + 1 > capacity) continue;
		availableResourceIds.push(resource.id);
		remainingCapacity += capacity - used;
	}
	return availableResourceIds.length === 0 ? null : {
		availableResourceIds,
		remainingCapacity
	};
}
function maxBufferOf(rule, candidates) {
	const own = Math.max(rule.bufferBefore ?? 0, rule.bufferAfter ?? 0);
	if (candidates === null) return own;
	return candidates.reduce((largest, resource) => Math.max(largest, resource.buffer?.before ?? 0, resource.buffer?.after ?? 0), own);
}
function generateSlots(input) {
	const maxSlots = input.maxSlots ?? 5e3;
	const resources = input.resources ?? [];
	const occupants = toOccupants(input.events ?? [], input.now);
	const slots = [];
	let truncated = false;
	let requiredStart = Infinity;
	let requiredEnd = -Infinity;
	for (const rule of input.rules) {
		if (rule.duration <= 0) throw new Error(`Slot rule "${rule.id}": duration must be positive`);
		const step = rule.step ?? rule.duration;
		if (step <= 0) throw new Error(`Slot rule "${rule.id}": step must be positive`);
		const layers = [[rule.calendarId]];
		const lowerBound = lowerBoundFor(rule, input, layers);
		const upperBound = upperBoundFor(rule, input);
		if (!Number.isFinite(lowerBound) || upperBound <= lowerBound) continue;
		const candidates = candidatesFor(rule, resources);
		const padding = maxBufferOf(rule, candidates);
		requiredStart = Math.min(requiredStart, lowerBound - padding);
		requiredEnd = Math.max(requiredEnd, upperBound + padding);
		const timeZone = require_resolve.resolveCalendarTimeZone(rule.calendarId, input.calendars) ?? input.timeZone;
		const openings = require_resolve.getLayeredWorkingTime(layers, {
			start: civilStamp(openingScanStart(lowerBound)),
			end: civilStamp(upperBound)
		}, input.calendars);
		for (const opening of openings) {
			const openingStart = civilMinutes(opening.start);
			const openingEnd = civilMinutes(opening.end);
			for (let slotStart = openingStart; slotStart + rule.duration <= openingEnd; slotStart += step) {
				const slotEnd = slotStart + rule.duration;
				if (slotStart < lowerBound || slotEnd > upperBound) continue;
				const occupancy = occupancyFor(rule, candidates, occupants, slotStart, slotEnd);
				if (occupancy === null) continue;
				const start = civilStamp(slotStart);
				for (const startEpochMs of resolveSlotInstants(start, timeZone)) {
					if (slots.length >= maxSlots) {
						truncated = true;
						break;
					}
					slots.push({
						ruleId: rule.id,
						start,
						end: civilStamp(slotEnd),
						startEpochMs,
						endEpochMs: startEpochMs + rule.duration * MS_PER_MINUTE,
						availableResourceIds: occupancy.availableResourceIds,
						remainingCapacity: occupancy.remainingCapacity
					});
				}
				if (truncated) break;
			}
			if (truncated) break;
		}
		if (truncated) break;
	}
	slots.sort((a, b) => a.startEpochMs - b.startEpochMs || (a.ruleId < b.ruleId ? -1 : a.ruleId > b.ruleId ? 1 : 0));
	return {
		slots,
		requiredRange: requiredStart === Infinity ? {
			start: input.range.start,
			end: input.range.end
		} : {
			start: civilStamp(requiredStart),
			end: civilStamp(requiredEnd)
		},
		truncated
	};
}

//#endregion
exports.DEFAULT_MAX_SLOTS = DEFAULT_MAX_SLOTS;
exports.generateSlots = generateSlots;
exports.resolveSlotInstants = resolveSlotInstants;
//# sourceMappingURL=generateSlots.cjs.map