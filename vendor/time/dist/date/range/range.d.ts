import { DateInput, DurationLike } from "../types.js";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.js";
import "../withDateOperation/index.js";
//#region src/date/range/range.d.ts
interface RangeOptions extends DateOperationOptions {
  start: DateInput;
  end: DateInput;
  step: DurationLike;
}
declare function range(options: RangeOptions): Array<Date>;
//#endregion
export { RangeOptions, range };
//# sourceMappingURL=range.d.ts.map