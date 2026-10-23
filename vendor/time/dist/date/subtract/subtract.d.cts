import { DateInput, DurationLike } from "../types.cjs";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.cjs";
import "../withDateOperation/index.cjs";
//#region src/date/subtract/subtract.d.ts
interface SubtractOptions extends DateOperationOptions {
  duration: DurationLike;
}
declare function subtract(input: DateInput, options: SubtractOptions): Date;
//#endregion
export { SubtractOptions, subtract };
//# sourceMappingURL=subtract.d.cts.map