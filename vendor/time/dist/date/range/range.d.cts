import { DateInput, DurationLike } from "../types.cjs";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.cjs";
import "../withDateOperation/index.cjs";
//#region src/date/range/range.d.ts
interface RangeOptions extends DateOperationOptions {
  start: DateInput;
  end: DateInput;
  step: DurationLike;
}
declare function range(options: RangeOptions): Array<Date>;
//#endregion
export { RangeOptions, range };
//# sourceMappingURL=range.d.cts.map