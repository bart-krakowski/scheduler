import { DependencyLink } from "../../validation/dependency/shift.cjs";
import "../../validation/dependency/index.cjs";
import { Temporal } from "@js-temporal/polyfill";
//#region src/kernel/modules/dependency.d.ts
interface DependencyValidationError {
  eventId: string;
  eventTitle: string;
  reason: 'blocked';
  message: string;
  originalStart: string;
  originalEnd: string;
}
interface DependencyApi {
  validateEventDependencies: (event: {
    id?: string;
    title: string;
    start: string;
    end: string;
  }, dependsOn: Array<DependencyLink>) => {
    valid: boolean;
    error?: DependencyValidationError;
  };
}
//#endregion
export { DependencyApi, DependencyValidationError };
//# sourceMappingURL=dependency.d.cts.map