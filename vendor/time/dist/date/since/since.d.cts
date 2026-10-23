import { DateInput, DateOptions } from "../types.cjs";
import { Temporal } from "@js-temporal/polyfill";
//#region src/date/since/since.d.ts
interface SinceOptions extends DateOptions {
  unit: Temporal.DateTimeUnit;
}
declare function since(start: DateInput, end: DateInput, options: SinceOptions): number;
//#endregion
export { SinceOptions, since };
//# sourceMappingURL=since.d.cts.map