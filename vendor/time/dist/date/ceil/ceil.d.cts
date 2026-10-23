import { DateInput } from "../types.cjs";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.cjs";
import "../withDateOperation/index.cjs";
//#region src/date/ceil/ceil.d.ts
type CeilUnit = 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
interface CeilOptions extends DateOperationOptions {
  unit: CeilUnit;
}
declare function ceil(input: DateInput, options: CeilOptions): Date;
//#endregion
export { CeilOptions, CeilUnit, ceil };
//# sourceMappingURL=ceil.d.cts.map