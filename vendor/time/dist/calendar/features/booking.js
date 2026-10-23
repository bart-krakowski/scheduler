import { toPlainDateTimeString } from "../../date/parse/parse.js";
import { resolveCalendarTimeZone } from "../../workingTime/resolve.js";
import { generateSlots } from "../../slots/generateSlots.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/calendar/features/booking.ts
const NO_RULES = [];
function bookingFeature() {
	const timeZoneOf = (host) => String(host.getOptions().timeZone);
	const toCivil = (value, timeZone) => Temporal.Instant.fromEpochMilliseconds(value.getTime()).toZonedDateTimeISO(timeZone).toPlainDateTime().toString({ calendarName: "never" });
	const slotResourcesOf = (host) => (host.getOptions().resources ?? []).map((resource) => ({
		id: resource.id,
		capacity: resource.capacity,
		buffer: resource.buffer
	}));
	const expiryOf = (event) => {
		const expiresAt = event.expiresAt;
		return expiresAt === void 0 ? void 0 : toPlainDateTimeString(expiresAt);
	};
	const occupyingEventsOf = (host) => host.getEvents().map((event) => ({
		id: event.id,
		start: toPlainDateTimeString(event.start),
		end: toPlainDateTimeString(event.end),
		resourceIds: (event.resources ?? []).map((resource) => typeof resource === "string" ? resource : resource.id),
		consumption: event.consumption,
		expiresAt: expiryOf(event)
	}));
	const rulesOf = (host, ruleIds) => {
		const rules = host.getOptions().slotRules ?? NO_RULES;
		return ruleIds ? rules.filter((rule) => ruleIds.includes(rule.id)) : rules;
	};
	const scopeToResources = (rules, resourceIds) => {
		if (!resourceIds) return rules;
		return rules.flatMap((rule) => {
			if (!rule.resourceIds) return [rule];
			const scoped = rule.resourceIds.filter((id) => resourceIds.includes(id));
			return scoped.length === 0 ? [] : [{
				...rule,
				resourceIds: scoped
			}];
		});
	};
	const unbackedRangesOf = (host, required) => {
		const loaded = host.getLoadedRanges();
		if (loaded === null) return [];
		const gaps = [];
		let cursor = required.start;
		for (const range of [...loaded].sort((a, b) => a.start < b.start ? -1 : 1)) {
			if (range.end <= cursor) continue;
			if (range.start >= required.end) break;
			if (range.start > cursor) gaps.push({
				start: cursor,
				end: range.start
			});
			cursor = range.end > cursor ? range.end : cursor;
			if (cursor >= required.end) break;
		}
		if (cursor < required.end) gaps.push({
			start: cursor,
			end: required.end
		});
		return gaps;
	};
	const toBookingRange = (range, timeZone) => ({
		start: new Date(Temporal.PlainDateTime.from(range.start).toZonedDateTime(timeZone).epochMilliseconds),
		end: new Date(Temporal.PlainDateTime.from(range.end).toZonedDateTime(timeZone).epochMilliseconds)
	});
	const toBookingSlot = (slot) => ({
		ruleId: slot.ruleId,
		start: new Date(slot.startEpochMs),
		end: new Date(slot.endEpochMs),
		availableResourceIds: slot.availableResourceIds,
		remainingCapacity: slot.remainingCapacity
	});
	const write = (host, slot, payload, reason) => {
		const rule = rulesOf(host).find((candidate) => candidate.id === slot.ruleId);
		const timeZone = resolveCalendarTimeZone(rule?.calendarId, host.getOptions().workingTime.calendars) ?? timeZoneOf(host);
		const resourceId = payload.resourceId ?? slot.availableResourceIds[0];
		const event = {
			id: payload.id,
			title: payload.title,
			start: toCivil(slot.start, timeZone),
			end: toCivil(slot.end, timeZone),
			calendarId: rule?.calendarId,
			...resourceId === void 0 ? {} : { resources: [resourceId] },
			...payload.consumption === void 0 ? {} : { consumption: payload.consumption },
			...payload.expiresAt === void 0 ? {} : { expiresAt: toPlainDateTimeString(payload.expiresAt) }
		};
		const { conflicts } = host.writeChecked([{
			kind: "add",
			event
		}], reason);
		return conflicts.length > 0 ? {
			success: false,
			conflicts
		} : {
			success: true,
			event
		};
	};
	return {
		name: "booking",
		requires: ["workingTime", "availability"],
		api: (host) => ({
			getSlotRules: () => [...rulesOf(host)],
			getSlots: (options) => {
				const timeZone = timeZoneOf(host);
				const result = generateSlots({
					rules: scopeToResources(rulesOf(host, options.ruleIds), options.resourceIds),
					range: {
						start: toPlainDateTimeString(options.start),
						end: toPlainDateTimeString(options.end)
					},
					now: toPlainDateTimeString(options.now ?? /* @__PURE__ */ new Date()),
					timeZone,
					calendars: host.getOptions().workingTime.calendars,
					resources: slotResourcesOf(host),
					events: occupyingEventsOf(host),
					maxSlots: options.maxSlots
				});
				return {
					slots: result.slots.map(toBookingSlot),
					requiredRange: toBookingRange(result.requiredRange, timeZone),
					unbackedRanges: unbackedRangesOf(host, result.requiredRange).map((range) => toBookingRange(range, timeZone)),
					truncated: result.truncated
				};
			},
			book: (slot, payload) => write(host, slot, payload, "book"),
			hold: (slot, payload) => write(host, slot, payload, "hold")
		})
	};
}

//#endregion
export { bookingFeature };
//# sourceMappingURL=booking.js.map