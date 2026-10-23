import { DateInput, DurationLike } from "../types.js";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.js";
import "../withDateOperation/index.js";
//#region src/date/add/add.d.ts
interface AddOptions extends DateOperationOptions {
  duration: DurationLike;
}
declare function add(input: DateInput, options: AddOptions): Date;
//#endregion
export { AddOptions, add };
//# sourceMappingURL=add.d.ts.map