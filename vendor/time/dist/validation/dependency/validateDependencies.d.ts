import { DependencyLink } from "./shift.js";
import { Temporal } from "@js-temporal/polyfill";
//#region src/validation/dependency/validateDependencies.d.ts
interface DependencyConflict {
  eventId: string;
  eventTitle: string;
  predecessorId: string;
  predecessorTitle: string;
  type: DependencyLink['type'];
  message: string;
  originalStart: string;
  originalEnd: string;
  anchorId?: string;
}
//#endregion
export { DependencyConflict };
//# sourceMappingURL=validateDependencies.d.ts.map