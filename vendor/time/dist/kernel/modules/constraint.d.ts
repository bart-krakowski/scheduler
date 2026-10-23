import { ConstraintConflict, SchedulingConstraint } from "../../validation/constraints/checkConstraint.js";
//#region src/kernel/modules/constraint.d.ts
interface ConstraintQuery {
  id?: string;
  title: string;
  start: string;
  end: string;
  constraint?: SchedulingConstraint;
}
interface ConstraintModuleApi {
  evaluateConstraint: (event: ConstraintQuery) => ConstraintConflict | null;
}
//#endregion
export { ConstraintModuleApi, ConstraintQuery };
//# sourceMappingURL=constraint.d.ts.map