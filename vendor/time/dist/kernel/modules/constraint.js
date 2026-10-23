import { toPlainDateTimeString } from "../../date/parse/parse.js";
import { checkConstraint } from "../../validation/constraints/checkConstraint.js";

//#region src/kernel/modules/constraint.ts
function evaluate(event) {
	return checkConstraint({
		id: event.id,
		title: event.title ?? event.id,
		start: toPlainDateTimeString(event.start),
		end: toPlainDateTimeString(event.end),
		constraint: event.constraint
	});
}
function toConflict(conflict) {
	return {
		code: `constraint/${conflict.type}`,
		message: conflict.message,
		eventIds: [conflict.eventId],
		detail: conflict
	};
}
function constraintModule(options = {}) {
	return {
		name: "constraint",
		api: () => ({ evaluateConstraint: (event) => checkConstraint({
			id: event.id,
			title: event.title,
			start: toPlainDateTimeString(event.start),
			end: toPlainDateTimeString(event.end),
			constraint: event.constraint
		}) }),
		contributions: [{
			pipeline: "write",
			kind: "validate",
			stage: "constraint-validate",
			priority: options.priority,
			run: (batch) => {
				const conflicts = [];
				for (const op of batch.ops) {
					if (op.kind === "remove" || op.kind === "intent") continue;
					const conflict = evaluate(op.kind === "add" ? op.event : op.after);
					if (conflict) conflicts.push(toConflict(conflict));
				}
				return conflicts;
			}
		}]
	};
}

//#endregion
export { constraintModule };
//# sourceMappingURL=constraint.js.map