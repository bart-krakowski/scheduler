import { DateInput } from "../types.js";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.js";
import "../withDateOperation/index.js";
//#region src/date/startOf/startOf.d.ts
type StartOfUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
interface StartOfOptions extends DateOperationOptions {
  unit: StartOfUnit;
}
declare function startOf(input: DateInput, options: StartOfOptions): Date;
//#endregion
export { StartOfOptions, StartOfUnit, startOf };
//# sourceMappingURL=startOf.d.ts.map