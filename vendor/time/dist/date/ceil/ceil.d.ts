import { DateInput } from "../types.js";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.js";
import "../withDateOperation/index.js";
//#region src/date/ceil/ceil.d.ts
type CeilUnit = 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
interface CeilOptions extends DateOperationOptions {
  unit: CeilUnit;
}
declare function ceil(input: DateInput, options: CeilOptions): Date;
//#endregion
export { CeilOptions, CeilUnit, ceil };
//# sourceMappingURL=ceil.d.ts.map