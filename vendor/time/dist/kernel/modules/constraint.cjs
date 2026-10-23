const require_parse = require('../../date/parse/parse.cjs');
const require_checkConstraint = require('../../validation/constraints/checkConstraint.cjs');

//#region src/kernel/modules/constraint.ts
function evaluate(event) {
	return require_checkConstraint.checkConstraint({
		id: event.id,
		title: event.title ?? event.id,
		start: require_parse.toPlainDateTimeString(event.start),
		end: require_parse.toPlainDateTimeString(event.end),
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
		api: () => ({ evaluateConstraint: (event) => require_checkConstraint.checkConstraint({
			id: event.id,
			title: event.title,
			start: require_parse.toPlainDateTimeString(event.start),
			end: require_parse.toPlainDateTimeString(event.end),
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
exports.constraintModule = constraintModule;
//# sourceMappingURL=constraint.cjs.map