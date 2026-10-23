import { DateInput } from "../types.cjs";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.cjs";
import "../withDateOperation/index.cjs";
//#region src/date/startOf/startOf.d.ts
type StartOfUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
interface StartOfOptions extends DateOperationOptions {
  unit: StartOfUnit;
}
declare function startOf(input: DateInput, options: StartOfOptions): Date;
//#endregion
export { StartOfOptions, StartOfUnit, startOf };
//# sourceMappingURL=startOf.d.cts.map