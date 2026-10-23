import "../../calendar/types.cjs";
import { KernelEvent } from "../types.cjs";
//#region src/kernel/modules/recurrence.d.ts
interface RecurrenceApi<E extends KernelEvent> {
  getMasterEvent: (event: E) => E;
}
//#endregion
export { RecurrenceApi };
//# sourceMappingURL=recurrence.d.cts.map