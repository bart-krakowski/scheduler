import { toPlainDateTimeString } from "../../date/parse/parse.js";
import { expandRecurringEvent } from "../../recurrence/expandRecurringEvent.js";
import { durationPreservingEnd, getRecurringOccurrence, materializeRecurringEdit, materializeRecurringRemove, normalizeRecurrenceRule, resolveOccurrenceStart } from "../../recurrence/materialize.js";
import { Temporal } from "@js-temporal/polyfill";

//#region src/kernel/modules/recurrence.ts
const EDIT_OCCURRENCE_INTENT = "recurrence/edit-occurrence";
const REMOVE_OCCURRENCE_INTENT = "recurrence/remove-occurrence";
function editOccurrenceIntent(payload) {
	return {
		kind: "intent",
		intent: EDIT_OCCURRENCE_INTENT,
		payload
	};
}
function removeOccurrenceIntent(payload) {
	return {
		kind: "intent",
		intent: REMOVE_OCCURRENCE_INTENT,
		payload
	};
}
function nextDay(iso) {
	return Temporal.PlainDate.from(iso.slice(0, 10)).add({ days: 1 }).toString({ calendarName: "never" });
}
function dayOf(value) {
	return toPlainDateTimeString(value).slice(0, 10);
}
function resolveEdit(payload, master, isTaken) {
	const updates = payload.updates;
	if (!master.recurrence || payload.scope === "all") return [{
		kind: "update",
		id: master.id,
		before: master,
		after: {
			...master,
			...updates
		}
	}];
	const occurrenceStart = resolveOccurrenceStart(master.start, payload.occurrenceStart);
	const occurrence = getRecurringOccurrence(master, occurrenceStart);
	if (!occurrence) return [];
	const occurrenceStartStr = toPlainDateTimeString(occurrence.start);
	const occurrenceEndStr = toPlainDateTimeString(occurrence.end);
	const nextStart = updates.start;
	const nextEnd = updates.end;
	const effectiveStart = nextStart != null ? toPlainDateTimeString(nextStart) : occurrenceStartStr;
	const effectiveEnd = nextEnd != null ? toPlainDateTimeString(nextEnd) : nextStart != null ? durationPreservingEnd(occurrenceStartStr, occurrenceEndStr, effectiveStart) : occurrenceEndStr;
	const recurrenceUpdate = updates.recurrence;
	const normalizedUpdates = {
		...updates,
		...nextStart != null ? { start: effectiveStart } : {},
		...nextEnd != null || nextStart != null ? { end: effectiveEnd } : {},
		...recurrenceUpdate != null ? { recurrence: normalizeRecurrenceRule(recurrenceUpdate) } : {}
	};
	if (payload.scope === "thisAndFollowing" && occurrenceStart === toPlainDateTimeString(master.start)) return [{
		kind: "update",
		id: master.id,
		before: master,
		after: {
			...master,
			...normalizedUpdates
		}
	}];
	const { nextMaster, addedEvents } = materializeRecurringEdit({
		master,
		scope: payload.scope,
		occurrence,
		occurrenceStart,
		effectiveStart,
		effectiveEnd,
		normalizedUpdates,
		recurrenceUpdate,
		isTaken
	});
	const ops = [{
		kind: "update",
		id: master.id,
		before: master,
		after: nextMaster
	}];
	for (const added of addedEvents) ops.push({
		kind: "add",
		event: added
	});
	return ops;
}
function resolveRemove(payload, master) {
	if (!master.recurrence || payload.scope === "all") return [{
		kind: "remove",
		id: master.id,
		event: master
	}];
	const occurrenceStart = resolveOccurrenceStart(master.start, payload.occurrenceStart);
	if (!getRecurringOccurrence(master, occurrenceStart)) return [];
	if (payload.scope === "thisAndFollowing" && occurrenceStart === toPlainDateTimeString(master.start)) return [{
		kind: "remove",
		id: master.id,
		event: master
	}];
	const { nextMaster } = materializeRecurringRemove({
		master,
		scope: payload.scope,
		occurrenceStart
	});
	return [{
		kind: "update",
		id: master.id,
		before: master,
		after: nextMaster
	}];
}
function recurrenceModule(options = {}) {
	return {
		name: "recurrence",
		api: (ctx) => ({ getMasterEvent: (event) => {
			const masterId = event._recurringMasterId;
			if (typeof masterId !== "string") return event;
			return ctx.getEvent(masterId) ?? event;
		} }),
		getRequiredRange: (op) => {
			if (op.kind !== "intent") return null;
			if (op.intent !== "recurrence/edit-occurrence" && op.intent !== "recurrence/remove-occurrence") return null;
			const payload = op.payload;
			const days = [payload.occurrenceStart, payload.updates?.start].filter((value) => value != null).map((value) => dayOf(value));
			if (days.length === 0) return null;
			const sorted = days.slice().sort();
			return {
				start: sorted[0],
				end: nextDay(sorted[sorted.length - 1])
			};
		},
		contributions: [{
			pipeline: "projection",
			stage: "recurrence-expand",
			priority: options.priority,
			run: (ctx) => {
				const windowStart = ctx.viewport.start.slice(0, 10);
				const windowEnd = nextDay(ctx.viewport.end);
				const out = [];
				for (const event of ctx.events) if (event.recurrence) {
					const occurrences = expandRecurringEvent(event, windowStart, windowEnd);
					out.push(...occurrences);
				} else out.push(event);
				return out;
			}
		}, {
			pipeline: "write",
			kind: "transform",
			stage: "recurrence-materialize",
			priority: options.priority,
			run: (batch, ctx) => {
				if (!batch.ops.some((op) => op.kind === "intent")) return batch;
				const isTaken = (id) => ctx.getEvent(id) !== void 0;
				const ops = [];
				for (const op of batch.ops) {
					if (op.kind !== "intent") {
						ops.push(op);
						continue;
					}
					if (op.intent !== "recurrence/edit-occurrence" && op.intent !== "recurrence/remove-occurrence") {
						ops.push(op);
						continue;
					}
					const payload = op.payload;
					const master = ctx.getEvent(payload.masterId);
					if (!master) continue;
					if (op.intent === "recurrence/edit-occurrence") ops.push(...resolveEdit(payload, master, isTaken));
					else ops.push(...resolveRemove(payload, master));
				}
				return {
					...batch,
					ops
				};
			}
		}]
	};
}

//#endregion
export { EDIT_OCCURRENCE_INTENT, REMOVE_OCCURRENCE_INTENT, editOccurrenceIntent, recurrenceModule, removeOccurrenceIntent };
//# sourceMappingURL=recurrence.js.map