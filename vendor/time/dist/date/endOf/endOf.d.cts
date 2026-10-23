import { DateInput } from "../types.cjs";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.cjs";
import "../withDateOperation/index.cjs";
//#region src/date/endOf/endOf.d.ts
type EndOfUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
interface EndOfOptions extends DateOperationOptions {
  unit: EndOfUnit;
}
declare function endOf(input: DateInput, options: EndOfOptions): Date;
//#endregion
export { EndOfOptions, EndOfUnit, endOf };
//# sourceMappingURL=endOf.d.cts.map