import { DateInput, DateOptions } from "../types.js";
import { Temporal } from "@js-temporal/polyfill";
//#region src/date/until/until.d.ts
interface UntilOptions extends DateOptions {
  unit: Temporal.DateTimeUnit;
}
declare function until(start: DateInput, end: DateInput, options: UntilOptions): number;
//#endregion
export { UntilOptions, until };
//# sourceMappingURL=until.d.ts.map