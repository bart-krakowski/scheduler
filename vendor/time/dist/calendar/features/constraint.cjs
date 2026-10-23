const require_parse = require('../../date/parse/parse.cjs');
const require_constraint = require('../../kernel/modules/constraint.cjs');

//#region src/calendar/features/constraint.ts
function schedulingConstraintFeature() {
	return {
		name: "constraint",
		module: () => require_constraint.constraintModule(),
		api: (_host, module) => ({ checkEventConstraint: (event, newStart, newEnd, newConstraint) => module.evaluateConstraint({
			id: event.id,
			title: event.title,
			start: newStart ?? require_parse.toPlainDateTimeString(event.start),
			end: newEnd ?? require_parse.toPlainDateTimeString(event.end),
			constraint: newConstraint ?? event.constraint
		}) })
	};
}

//#endregion
exports.schedulingConstraintFeature = schedulingConstraintFeature;
//# sourceMappingURL=constraint.cjs.map