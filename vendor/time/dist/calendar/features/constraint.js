import { toPlainDateTimeString } from "../../date/parse/parse.js";
import { constraintModule } from "../../kernel/modules/constraint.js";

//#region src/calendar/features/constraint.ts
function schedulingConstraintFeature() {
	return {
		name: "constraint",
		module: () => constraintModule(),
		api: (_host, module) => ({ checkEventConstraint: (event, newStart, newEnd, newConstraint) => module.evaluateConstraint({
			id: event.id,
			title: event.title,
			start: newStart ?? toPlainDateTimeString(event.start),
			end: newEnd ?? toPlainDateTimeString(event.end),
			constraint: newConstraint ?? event.constraint
		}) })
	};
}

//#endregion
export { schedulingConstraintFeature };
//# sourceMappingURL=constraint.js.map