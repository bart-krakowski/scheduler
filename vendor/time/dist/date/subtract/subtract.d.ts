import { DateInput, DurationLike } from "../types.js";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.js";
import "../withDateOperation/index.js";
//#region src/date/subtract/subtract.d.ts
interface SubtractOptions extends DateOperationOptions {
  duration: DurationLike;
}
declare function subtract(input: DateInput, options: SubtractOptions): Date;
//#endregion
export { SubtractOptions, subtract };
//# sourceMappingURL=subtract.d.ts.map