import { DateInput, DurationLike } from "../types.cjs";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.cjs";
import "../withDateOperation/index.cjs";
//#region src/date/add/add.d.ts
interface AddOptions extends DateOperationOptions {
  duration: DurationLike;
}
declare function add(input: DateInput, options: AddOptions): Date;
//#endregion
export { AddOptions, add };
//# sourceMappingURL=add.d.cts.map