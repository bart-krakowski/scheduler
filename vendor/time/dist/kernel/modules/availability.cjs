const require_parse = require('../../date/parse/parse.cjs');
const require_checkAvailability = require('../../validation/availability/checkAvailability.cjs');

//#region src/kernel/modules/availability.ts
function resolveResources(event, known) {
	return (event.resources ?? []).map((r) => typeof r === "string" ? known.find((res) => res.id === r) ?? {
		id: r,
		label: r
	} : r);
}
function resourceIdsOf(event) {
	return (event.resources ?? []).map((r) => typeof r === "string" ? r : r.id);
}
function toConflict(event, conflict) {
	return {
		code: `availability/${conflict.resourceDetails[0]?.reason ?? "outside-hours"}`,
		message: conflict.description,
		eventIds: [event.id],
		detail: conflict
	};
}
function availabilityModule(options) {
	const knownResources = () => typeof options.resources === "function" ? options.resources() : options.resources;
	const workingTime = () => typeof options.workingTime === "function" ? options.workingTime() : options.workingTime;
	const evaluate = (event, others) => {
		const resolved = resolveResources(event, knownResources());
		if (resolved.length === 0) return [];
		const otherEvents = others.filter((e) => e.id !== event.id && !e._originalStart).map((e) => ({
			id: e.id,
			start: require_parse.toPlainDateTimeString(e._originalStart ?? e.start),
			end: require_parse.toPlainDateTimeString(e._originalEnd ?? e.end),
			resourceIds: resourceIdsOf(e),
			consumption: e.consumption,
			masterId: e._recurringMasterId ?? e.id
		}));
		return require_checkAvailability.checkAvailability({
			event: {
				id: event.id,
				title: event.title ?? event.id,
				start: require_parse.toPlainDateTimeString(event.start),
				end: require_parse.toPlainDateTimeString(event.end),
				calendarId: event.calendarId
			},
			resources: resolved,
			workingTime: workingTime(),
			consumption: event.consumption,
			otherEvents
		});
	};
	return {
		name: "availability",
		api: (ctx) => ({ evaluateAvailability: (event) => evaluate(event, ctx.getEvents()) }),
		contributions: [{
			pipeline: "write",
			kind: "validate",
			stage: "availability-validate",
			priority: options.priority,
			run: (batch, ctx) => {
				const conflicts = [];
				const settled = new Map(ctx.getEvents().map((e) => [e.id, e]));
				for (const op of batch.ops) {
					if (op.kind === "intent") continue;
					if (op.kind === "remove") settled.delete(op.id);
					else if (op.kind === "add") settled.set(op.event.id, op.event);
					else settled.set(op.id, op.after);
				}
				const others = [...settled.values()];
				for (const op of batch.ops) {
					if (op.kind === "remove" || op.kind === "intent") continue;
					const event = op.kind === "add" ? op.event : op.after;
					for (const conflict of evaluate(event, others)) conflicts.push(toConflict(event, conflict));
				}
				return conflicts;
			}
		}]
	};
}

//#endregion
exports.availabilityModule = availabilityModule;
//# sourceMappingURL=availability.cjs.map