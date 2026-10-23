import "../../calendar/types.js";
import { KernelEvent } from "../types.js";
//#region src/kernel/modules/recurrence.d.ts
interface RecurrenceApi<E extends KernelEvent> {
  getMasterEvent: (event: E) => E;
}
//#endregion
export { RecurrenceApi };
//# sourceMappingURL=recurrence.d.ts.map