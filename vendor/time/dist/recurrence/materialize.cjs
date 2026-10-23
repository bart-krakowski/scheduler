const require_parse = require('../date/parse/parse.cjs');
const require_expandRecurringEvent = require('./expandRecurringEvent.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/recurrence/materialize.ts
function normalizeRecurrenceRule(rule) {
	return {
		...rule,
		exDates: rule.exDates?.map((value) => typeof value === "string" && !value.includes("T") ? value : require_parse.toPlainDateTimeString(value)),
		overrides: rule.overrides?.map((override) => ({
			...override,
			originalStart: typeof override.originalStart === "string" && !override.originalStart.includes("T") ? override.originalStart : require_parse.toPlainDateTimeString(override.originalStart),
			...override.start != null ? { start: require_parse.toPlainDateTimeString(override.start) } : {},
			...override.end != null ? { end: require_parse.toPlainDateTimeString(override.end) } : {}
		}))
	};
}
function resolveOccurrenceStart(masterStart, occurrenceStart) {
	return occurrenceStart != null ? require_parse.toPlainDateTimeString(occurrenceStart) : require_parse.toPlainDateTimeString(masterStart);
}
function recurrenceInputMatchesOccurrence(value, occurrenceStart) {
	if (typeof value === "string" && !value.includes("T")) return _js_temporal_polyfill.Temporal.PlainDate.from(value).toString({ calendarName: "never" }) === occurrenceStart.split("T")[0];
	return require_parse.toPlainDateTimeString(value) === occurrenceStart;
}
function compareRecurrenceInputToOccurrence(value, occurrenceStart) {
	if (typeof value === "string" && !value.includes("T")) return _js_temporal_polyfill.Temporal.PlainDate.compare(_js_temporal_polyfill.Temporal.PlainDate.from(value), _js_temporal_polyfill.Temporal.PlainDate.from(occurrenceStart.split("T")[0]));
	return _js_temporal_polyfill.Temporal.PlainDateTime.compare(_js_temporal_polyfill.Temporal.PlainDateTime.from(require_parse.toPlainDateTimeString(value)), _js_temporal_polyfill.Temporal.PlainDateTime.from(occurrenceStart));
}
function durationPreservingEnd(originalStart, originalEnd, nextStart) {
	const durationMs = _js_temporal_polyfill.Temporal.PlainDateTime.from(originalStart).toZonedDateTime("UTC").until(_js_temporal_polyfill.Temporal.PlainDateTime.from(originalEnd).toZonedDateTime("UTC")).total("milliseconds");
	return _js_temporal_polyfill.Temporal.PlainDateTime.from(nextStart).toZonedDateTime("UTC").add({ milliseconds: durationMs }).toPlainDateTime().toString({ smallestUnit: "second" });
}
function getRecurringOccurrence(master, occurrenceStart) {
	const occurrenceDate = occurrenceStart.split("T")[0];
	let windowStart = occurrenceDate;
	let windowEnd = _js_temporal_polyfill.Temporal.PlainDate.from(occurrenceDate).add({ days: 1 }).toString({ calendarName: "never" });
	const override = master.recurrence?.overrides?.find((candidate) => recurrenceInputMatchesOccurrence(candidate.originalStart, occurrenceStart));
	if (override?.start != null) {
		const overrideDate = require_parse.toPlainDateTimeString(override.start).split("T")[0];
		windowStart = overrideDate < occurrenceDate ? overrideDate : occurrenceDate;
		const maxDate = overrideDate > occurrenceDate ? overrideDate : occurrenceDate;
		windowEnd = _js_temporal_polyfill.Temporal.PlainDate.from(maxDate).add({ days: 1 }).toString({ calendarName: "never" });
	}
	return require_expandRecurringEvent.expandRecurringEvent(master, windowStart, windowEnd).find((occ) => (occ._occurrenceOriginalStart ?? occ.start) === occurrenceStart) ?? null;
}
function makeSplitRecurringEventId(masterId, occurrenceStart, isTaken) {
	const safeStart = occurrenceStart.replace(/[^0-9A-Za-z]/g, "");
	let id = `${masterId}_${safeStart}`;
	let suffix = 1;
	while (isTaken(id)) {
		id = `${masterId}_${safeStart}_${suffix}`;
		suffix++;
	}
	return id;
}
function dropOccurrenceExceptions(recurrence, occurrenceStart) {
	if (!recurrence) return null;
	const rule = normalizeRecurrenceRule(recurrence);
	const exDates = (rule.exDates ?? []).filter((value) => !recurrenceInputMatchesOccurrence(value, occurrenceStart));
	const overrides = (rule.overrides ?? []).filter((override) => !recurrenceInputMatchesOccurrence(override.originalStart, occurrenceStart));
	if (exDates.length === (rule.exDates ?? []).length && overrides.length === (rule.overrides ?? []).length) return null;
	return normalizeRecurrenceRule({
		...rule,
		exDates,
		overrides
	});
}
function materializeRecurringEdit(input) {
	const { master, scope, occurrence, occurrenceStart, effectiveStart, effectiveEnd, normalizedUpdates, recurrenceUpdate, isTaken } = input;
	const rule = normalizeRecurrenceRule(master.recurrence);
	if (scope === "this") {
		const exDates = (rule.exDates ?? []).filter((value) => !recurrenceInputMatchesOccurrence(value, occurrenceStart));
		const overrides = (rule.overrides ?? []).filter((override) => !recurrenceInputMatchesOccurrence(override.originalStart, occurrenceStart));
		const overrideFields = { ...normalizedUpdates };
		delete overrideFields.recurrence;
		delete overrideFields._originalStart;
		delete overrideFields._originalEnd;
		delete overrideFields._recurringMasterId;
		delete overrideFields._occurrenceIndex;
		delete overrideFields._occurrenceOriginalStart;
		overrides.push({
			...overrideFields,
			originalStart: occurrenceStart,
			...normalizedUpdates.start != null ? { start: effectiveStart } : {},
			...normalizedUpdates.end != null ? { end: effectiveEnd } : {}
		});
		return {
			nextMaster: {
				...master,
				recurrence: normalizeRecurrenceRule({
					...rule,
					exDates,
					overrides
				})
			},
			addedEvents: []
		};
	}
	const splitDate = occurrenceStart.split("T")[0];
	const oldRule = normalizeRecurrenceRule({
		...rule,
		until: splitDate
	});
	const remainingRule = normalizeRecurrenceRule({
		...rule,
		...rule.count !== void 0 && rule.until === void 0 ? { count: Math.max(1, rule.count - (occurrence._occurrenceIndex ?? 0)) } : {},
		exDates: rule.exDates?.filter((value) => compareRecurrenceInputToOccurrence(value, occurrenceStart) > 0),
		overrides: rule.overrides?.filter((override) => compareRecurrenceInputToOccurrence(override.originalStart, occurrenceStart) > 0)
	});
	const updateFields = { ...normalizedUpdates };
	delete updateFields.recurrence;
	const splitEvent = {
		...occurrence,
		...updateFields,
		id: makeSplitRecurringEventId(master.id, occurrenceStart, isTaken),
		start: effectiveStart,
		end: effectiveEnd,
		recurrence: recurrenceUpdate != null ? normalizeRecurrenceRule(recurrenceUpdate) : remainingRule,
		_originalStart: void 0,
		_originalEnd: void 0,
		_recurringMasterId: void 0,
		_occurrenceIndex: void 0,
		_occurrenceOriginalStart: void 0
	};
	return {
		nextMaster: {
			...master,
			recurrence: oldRule
		},
		addedEvents: [splitEvent]
	};
}
function materializeRecurringRemove(input) {
	const { master, scope, occurrenceStart } = input;
	const rule = normalizeRecurrenceRule(master.recurrence);
	if (scope === "this") {
		const exDates = (rule.exDates ?? []).filter((value) => !recurrenceInputMatchesOccurrence(value, occurrenceStart));
		exDates.push(occurrenceStart);
		const overrides = (rule.overrides ?? []).filter((override) => !recurrenceInputMatchesOccurrence(override.originalStart, occurrenceStart));
		return { nextMaster: {
			...master,
			recurrence: normalizeRecurrenceRule({
				...rule,
				exDates,
				overrides
			})
		} };
	}
	return { nextMaster: {
		...master,
		recurrence: normalizeRecurrenceRule({
			...rule,
			until: occurrenceStart.split("T")[0]
		})
	} };
}

//#endregion
exports.compareRecurrenceInputToOccurrence = compareRecurrenceInputToOccurrence;
exports.dropOccurrenceExceptions = dropOccurrenceExceptions;
exports.durationPreservingEnd = durationPreservingEnd;
exports.getRecurringOccurrence = getRecurringOccurrence;
exports.makeSplitRecurringEventId = makeSplitRecurringEventId;
exports.materializeRecurringEdit = materializeRecurringEdit;
exports.materializeRecurringRemove = materializeRecurringRemove;
exports.normalizeRecurrenceRule = normalizeRecurrenceRule;
exports.recurrenceInputMatchesOccurrence = recurrenceInputMatchesOccurrence;
exports.resolveOccurrenceStart = resolveOccurrenceStart;
//# sourceMappingURL=materialize.cjs.map