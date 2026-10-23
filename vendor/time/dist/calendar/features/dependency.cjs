const require_parse = require('../../date/parse/parse.cjs');
const require_shift = require('../../validation/dependency/shift.cjs');
const require_computeCascade = require('../../validation/dependency/computeCascade.cjs');
const require_propagate = require('../../validation/dependency/propagate.cjs');
const require_anchors = require('../../validation/dependency/anchors.cjs');
const require_graph = require('../../validation/dependency/graph.cjs');
const require_dependency = require('../../kernel/modules/dependency.cjs');
let _js_temporal_polyfill = require("@js-temporal/polyfill");

//#region src/calendar/features/dependency.ts
function eventDependencyFeature() {
	const epochMs = (host, value) => _js_temporal_polyfill.Temporal.PlainDateTime.from(value).toZonedDateTime(host.getOptions().timeZone).epochMilliseconds;
	const resolveShifts = (host, shifts) => {
		const resolved = [];
		for (const shift of shifts) {
			const event = host.getEvent(shift.id);
			if (!event) continue;
			resolved.push({
				event,
				newStart: shift.newStart,
				newEnd: shift.newEnd
			});
		}
		return resolved;
	};
	const graphOf = (host, override) => host.getEvents().map((event) => ({
		id: event.id,
		title: event.title,
		start: override?.id === event.id ? override.start : require_parse.toPlainDateTimeString(event.start),
		end: override?.id === event.id ? override.end : require_parse.toPlainDateTimeString(event.end),
		dependsOn: event.dependsOn,
		manuallyScheduled: event.manuallyScheduled
	}));
	const applyShifts = (graph, shifts) => {
		if (shifts.length === 0) return graph;
		const byId = new Map(shifts.map((shift) => [shift.id, shift]));
		return graph.map((event) => {
			const shift = byId.get(event.id);
			return shift ? {
				...event,
				start: shift.newStart,
				end: shift.newEnd
			} : event;
		});
	};
	return {
		name: "dependency",
		module: (ctx) => require_dependency.dependencyModule({ timeZone: ctx.timeZone }),
		api: (host, module) => ({
			validateEventDependencies: (event, dependsOn) => module.validateEventDependencies(event, dependsOn),
			getPredecessorShifts: (eventId, newStart, newEnd) => resolveShifts(host, require_propagate.propagateToPredecessors({
				sourceId: eventId,
				events: graphOf(host, {
					id: eventId,
					start: newStart,
					end: newEnd
				}),
				timeZone: host.getOptions().timeZone,
				visited: /* @__PURE__ */ new Set([eventId])
			})),
			getDependentShifts: (eventId, newStart, newEnd) => resolveShifts(host, require_propagate.propagateToDependents({
				sourceId: eventId,
				events: graphOf(host, {
					id: eventId,
					start: newStart,
					end: newEnd
				}),
				timeZone: host.getOptions().timeZone,
				visited: /* @__PURE__ */ new Set([eventId])
			})),
			getAffectedByDelta: (eventId, deltaMs) => resolveShifts(host, require_computeCascade.computeCascade({
				sourceId: eventId,
				deltaMs,
				events: graphOf(host),
				timeZone: host.getOptions().timeZone,
				visited: /* @__PURE__ */ new Set([eventId])
			})),
			getAnchorConflicts: (eventId, newStart, newEnd) => {
				const timeZone = host.getOptions().timeZone;
				const moved = graphOf(host, {
					id: eventId,
					start: newStart,
					end: newEnd
				});
				const visited = /* @__PURE__ */ new Set([eventId]);
				const shifts = [...require_propagate.propagateToPredecessors({
					sourceId: eventId,
					events: moved,
					timeZone,
					visited
				})];
				shifts.push(...require_propagate.propagateToDependents({
					sourceId: eventId,
					events: applyShifts(moved, shifts),
					timeZone,
					visited
				}));
				return require_anchors.findAnchoredViolations({
					events: applyShifts(moved, shifts),
					changedIds: [eventId, ...shifts.map((shift) => shift.id)],
					timeZone
				});
			},
			findViolatedDependency: (event, proposedStartMs, proposedEndMs) => {
				for (const dependency of event.dependsOn ?? []) {
					const predecessor = host.getEvent(dependency.id);
					if (!predecessor) continue;
					if (require_shift.requiredShiftMs(dependency.type, epochMs(host, require_parse.toPlainDateTimeString(predecessor.start)), epochMs(host, require_parse.toPlainDateTimeString(predecessor.end)), proposedStartMs, proposedEndMs, require_shift.lagMs(dependency)) > 0) return {
						dependency,
						predecessor
					};
				}
				return null;
			},
			createDependency: (sourceId, targetId, type = "FS", lag) => {
				const sourceEvent = host.getEvent(sourceId);
				const targetEvent = host.getEvent(targetId);
				if (!sourceEvent || !targetEvent) return { blocked: false };
				const currentDeps = targetEvent.dependsOn ?? [];
				if (currentDeps.some((d) => d.id === sourceId && d.type === type && (d.lag ?? 0) === (lag ?? 0))) return { blocked: false };
				const targetStartStr = require_parse.toPlainDateTimeString(targetEvent.start);
				const targetEndStr = require_parse.toPlainDateTimeString(targetEvent.end);
				const cycle = (message) => ({
					blocked: true,
					error: {
						eventId: targetId,
						eventTitle: targetEvent.title,
						reason: "blocked",
						message,
						originalStart: targetStartStr,
						originalEnd: targetEndStr
					}
				});
				if (sourceId === targetId) return cycle("circular dependency: an event cannot depend on itself");
				if (require_graph.hasDependencyPath(graphOf(host), sourceId, targetId)) return cycle(`circular dependency: ${sourceId} already depends on ${targetId} (directly or indirectly)`);
				const rescheduled = require_propagate.shiftToSatisfyLink({
					type,
					predecessor: {
						start: require_parse.toPlainDateTimeString(sourceEvent.start),
						end: require_parse.toPlainDateTimeString(sourceEvent.end)
					},
					successor: {
						start: targetStartStr,
						end: targetEndStr
					},
					timeZone: host.getOptions().timeZone,
					lag
				});
				if (rescheduled && targetEvent.manuallyScheduled) return {
					blocked: true,
					error: {
						eventId: targetId,
						eventTitle: targetEvent.title,
						reason: "blocked",
						message: `Cannot connect (${type}): "${targetEvent.title}" is manually scheduled and would have to move.`,
						originalStart: targetStartStr,
						originalEnd: targetEndStr,
						attemptedStart: rescheduled.start,
						attemptedEnd: rescheduled.end
					}
				};
				if (rescheduled) {
					const validation = host.validateMove(targetId, rescheduled.start, rescheduled.end);
					if (validation.blocked) return {
						blocked: true,
						error: {
							eventId: targetId,
							eventTitle: validation.blockedEventTitle ?? targetEvent.title,
							reason: "unavailable-time",
							message: validation.message ?? `Cannot connect (${type}): the resulting schedule would fall in unavailable time.`,
							originalStart: targetStartStr,
							originalEnd: targetEndStr,
							attemptedStart: rescheduled.start,
							attemptedEnd: rescheduled.end
						}
					};
				}
				host.commitUpdate(targetId, {
					dependsOn: [...currentDeps, lag ? {
						id: sourceId,
						type,
						lag
					} : {
						id: sourceId,
						type
					}],
					...rescheduled && {
						start: rescheduled.start,
						end: rescheduled.end
					}
				});
				return { blocked: false };
			}
		})
	};
}

//#endregion
exports.eventDependencyFeature = eventDependencyFeature;
//# sourceMappingURL=dependency.cjs.map