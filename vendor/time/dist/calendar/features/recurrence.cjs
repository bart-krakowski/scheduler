const require_parse = require('../../date/parse/parse.cjs');
const require_TimeClient = require('../../client/TimeClient.cjs');
const require_materialize = require('../../recurrence/materialize.cjs');
const require_occurrence = require('../../recurrence/occurrence.cjs');
const require_recurrence = require('../../kernel/modules/recurrence.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/calendar/features/recurrence.ts
function eventRecurrenceFeature() {
	const resolveMaster = (host, eventId) => host.getEvent(eventId) ?? host.getEvent(require_occurrence.masterIdOf(eventId));
	const cursor = (host, fromDate) => fromDate ? require_parse.toPlainDateTimeString(fromDate).slice(0, 10) : host.getState().activeDate;
	const addedFrom = (ops) => ops.flatMap((op) => op.kind === "add" ? [op.event] : []);
	const emitResult = (emit, added) => {
		for (const event of added) require_TimeClient.getTimeClient().emit("event:added", {
			eventId: event.id,
			eventTitle: event.title,
			start: event.start,
			end: event.end
		});
		if (emit.type === "updated") {
			require_TimeClient.getTimeClient().emit("event:updated", {
				eventId: emit.eventId,
				eventTitle: emit.eventTitle,
				start: emit.start,
				end: emit.end,
				updates: emit.updates
			});
			return;
		}
		require_TimeClient.getTimeClient().emit("event:removed", {
			eventId: emit.eventId,
			eventTitle: emit.eventTitle,
			start: emit.start,
			end: emit.end
		});
	};
	const writeOccurrenceEdit = (host, master, scope, occurrenceStart, updates, emit) => {
		const committed = host.write([require_recurrence.editOccurrenceIntent({
			masterId: master.id,
			scope,
			occurrenceStart,
			updates
		})], "recurrence/updated");
		if (committed.length === 0) return;
		const added = addedFrom(committed);
		emitResult(typeof emit === "function" ? emit(added[0]) : emit, added);
	};
	const writeOccurrenceRemove = (host, master, scope, occurrenceStart, emit) => {
		const committed = host.write([require_recurrence.removeOccurrenceIntent({
			masterId: master.id,
			scope,
			occurrenceStart
		})], "recurrence/removed");
		if (committed.length === 0) return;
		emitResult(emit, addedFrom(committed));
	};
	return {
		name: "recurrence",
		module: () => require_recurrence.recurrenceModule(),
		api: (host, module) => ({
			getMasterEvent: (event) => module.getMasterEvent(event),
			resolveOccurrence: (eventId, occurrenceStart, fallbackStart) => {
				const direct = host.getEvent(eventId);
				const master = resolveMaster(host, eventId);
				if (!master?.recurrence) return direct;
				const resolvedStart = occurrenceStart ?? (direct ? require_parse.toPlainDateTimeString(direct.start) : fallbackStart);
				if (!resolvedStart) return direct;
				return require_materialize.getRecurringOccurrence(master, resolvedStart) ?? direct ?? master;
			},
			goToNextOccurrence: (eventId, fromDate) => {
				const master = resolveMaster(host, eventId);
				if (!master) return;
				const next = require_occurrence.nextOccurrenceDate(master, cursor(host, fromDate));
				if (next) host.goToSpecificPeriod(next);
			},
			goToPreviousOccurrence: (eventId, fromDate) => {
				const master = resolveMaster(host, eventId);
				if (!master) return;
				const previous = require_occurrence.previousOccurrenceDate(master, cursor(host, fromDate));
				if (previous) host.goToSpecificPeriod(previous);
			},
			editRecurringEvent: async (eventId, updates, options) => {
				const master = resolveMaster(host, eventId);
				if (!master) return {
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
				if (!master.recurrence || options.scope === "all") return host.editEvent(master.id, updates, { dependsOn: options.dependsOn });
				const occurrenceStart = require_materialize.resolveOccurrenceStart(master.start, options.occurrenceStart);
				const occurrence = require_materialize.getRecurringOccurrence(master, occurrenceStart);
				if (!occurrence) return {
					success: false,
					error: {
						eventId,
						eventTitle: master.title,
						reason: "blocked",
						message: `Occurrence "${occurrenceStart}" not found.`,
						originalStart: occurrenceStart,
						originalEnd: occurrenceStart
					}
				};
				const occurrenceStartStr = require_parse.toPlainDateTimeString(occurrence.start);
				const occurrenceEndStr = require_parse.toPlainDateTimeString(occurrence.end);
				const effectiveStart = updates.start != null ? require_parse.toPlainDateTimeString(updates.start) : occurrenceStartStr;
				const effectiveEnd = updates.end != null ? require_parse.toPlainDateTimeString(updates.end) : updates.start != null ? require_materialize.durationPreservingEnd(occurrenceStartStr, occurrenceEndStr, effectiveStart) : occurrenceEndStr;
				const oldStartDateStr = occurrenceStartStr.slice(0, 10);
				const newStartDateStr = effectiveStart.slice(0, 10);
				const rangeStart = oldStartDateStr < newStartDateStr ? oldStartDateStr : newStartDateStr;
				const oldEndDate = _js_temporal_polyfill.Temporal.PlainDate.from(occurrenceEndStr.slice(0, 10)).add({ days: 1 });
				const newEndDate = _js_temporal_polyfill.Temporal.PlainDate.from(effectiveEnd.slice(0, 10)).add({ days: 1 });
				const rangeEndPlain = _js_temporal_polyfill.Temporal.PlainDate.compare(oldEndDate, newEndDate) > 0 ? oldEndDate : newEndDate;
				await host.fetchEventsForRange(rangeStart, rangeEndPlain.toString({ calendarName: "never" }));
				if (options.dependsOn && options.dependsOn.length > 0) {
					const depValidation = host.validateEventDependencies({
						id: occurrence.id,
						title: updates.title ?? occurrence.title,
						start: effectiveStart,
						end: effectiveEnd
					}, options.dependsOn);
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
					const placementValidation = host.validateEventPlacement({
						id: occurrence.id,
						title: updates.title ?? occurrence.title,
						start: effectiveStart,
						end: effectiveEnd,
						resources: updates.resources ?? occurrence.resources,
						consumption: updates.consumption ?? occurrence.consumption
					});
					if (placementValidation.blocked) return {
						success: false,
						error: {
							eventId,
							eventTitle: occurrence.title,
							reason: "blocked",
							message: placementValidation.message ?? `Cannot move "${occurrence.title}" to this position.`,
							originalStart: occurrenceStartStr,
							originalEnd: occurrenceEndStr,
							attemptedStart: effectiveStart,
							attemptedEnd: effectiveEnd
						}
					};
				}
				const recurrenceUpdate = updates.recurrence;
				const normalizedUpdates = {
					...updates,
					...updates.start != null ? { start: effectiveStart } : {},
					...updates.end != null || updates.start != null ? { end: effectiveEnd } : {},
					...recurrenceUpdate != null ? { recurrence: require_materialize.normalizeRecurrenceRule(recurrenceUpdate) } : {}
				};
				if (options.scope === "this") {
					writeOccurrenceEdit(host, master, "this", occurrenceStart, updates, {
						type: "updated",
						eventId: occurrence.id,
						eventTitle: updates.title ?? occurrence.title,
						start: effectiveStart,
						end: effectiveEnd,
						updates: normalizedUpdates
					});
					return { success: true };
				}
				if (occurrenceStart === require_parse.toPlainDateTimeString(master.start)) {
					const withoutOwnException = recurrenceUpdate != null ? null : require_materialize.dropOccurrenceExceptions(master.recurrence, occurrenceStart);
					return host.editEvent(master.id, withoutOwnException ? {
						...updates,
						recurrence: withoutOwnException
					} : updates, { dependsOn: options.dependsOn });
				}
				writeOccurrenceEdit(host, master, "thisAndFollowing", occurrenceStart, updates, (added) => ({
					type: "updated",
					eventId: added.id,
					eventTitle: added.title,
					start: added.start,
					end: added.end,
					updates: normalizedUpdates
				}));
				return { success: true };
			},
			removeRecurringEvent: (eventId, options) => {
				const master = resolveMaster(host, eventId);
				if (!master) return;
				if (!master.recurrence || options.scope === "all") {
					host.removeEvent(master.id);
					return;
				}
				const occurrenceStart = require_materialize.resolveOccurrenceStart(master.start, options.occurrenceStart);
				const occurrence = require_materialize.getRecurringOccurrence(master, occurrenceStart);
				if (!occurrence) return;
				const occurrenceStartStr = require_parse.toPlainDateTimeString(occurrence.start);
				const occurrenceEndStr = require_parse.toPlainDateTimeString(occurrence.end);
				if (options.scope === "this") {
					writeOccurrenceRemove(host, master, "this", occurrenceStart, {
						type: "removed",
						eventId: occurrence.id,
						eventTitle: occurrence.title,
						start: occurrenceStartStr,
						end: occurrenceEndStr
					});
					return;
				}
				if (occurrenceStart === require_parse.toPlainDateTimeString(master.start)) {
					host.removeEvent(master.id);
					return;
				}
				writeOccurrenceRemove(host, master, "thisAndFollowing", occurrenceStart, {
					type: "removed",
					eventId: occurrence.id,
					eventTitle: occurrence.title,
					start: occurrenceStartStr,
					end: occurrenceEndStr
				});
			}
		})
	};
}

//#endregion
exports.eventRecurrenceFeature = eventRecurrenceFeature;
//# sourceMappingURL=recurrence.cjs.map