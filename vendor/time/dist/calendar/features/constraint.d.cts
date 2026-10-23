import { Event, Resource, SchedulingConstraint } from "../types.cjs";
import { CalendarFeature } from "./types.cjs";
import { ConstraintConflict } from "../../validation/constraints/checkConstraint.cjs";
import { ConstraintModuleApi } from "../../kernel/modules/constraint.cjs";
import "../../kernel/modules/index.cjs";
//#region src/calendar/features/constraint.d.ts
interface ConstraintApi<TResource extends Resource, TEvent extends Event<TResource>> {
  checkEventConstraint: (event: TEvent, newStart?: string, newEnd?: string, newConstraint?: SchedulingConstraint) => ConstraintConflict | null;
}
declare function schedulingConstraintFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, ConstraintModuleApi, ConstraintApi<TResource, TEvent>, 'constraint'>;
//#endregion
export { ConstraintApi, schedulingConstraintFeature };
//# sourceMappingURL=constraint.d.cts.map