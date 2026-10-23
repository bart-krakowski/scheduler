import { Event, Resource, SchedulingConstraint } from "../types.js";
import { CalendarFeature } from "./types.js";
import { ConstraintConflict } from "../../validation/constraints/checkConstraint.js";
import { ConstraintModuleApi } from "../../kernel/modules/constraint.js";
import "../../kernel/modules/index.js";
//#region src/calendar/features/constraint.d.ts
interface ConstraintApi<TResource extends Resource, TEvent extends Event<TResource>> {
  checkEventConstraint: (event: TEvent, newStart?: string, newEnd?: string, newConstraint?: SchedulingConstraint) => ConstraintConflict | null;
}
declare function schedulingConstraintFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, ConstraintModuleApi, ConstraintApi<TResource, TEvent>, 'constraint'>;
//#endregion
export { ConstraintApi, schedulingConstraintFeature };
//# sourceMappingURL=constraint.d.ts.map