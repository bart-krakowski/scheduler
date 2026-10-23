import { DateInput } from "../types.js";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.js";
import "../withDateOperation/index.js";
//#region src/date/set/set.d.ts
interface SetFields {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  microsecond?: number;
  nanosecond?: number;
}
interface SetOptions extends DateOperationOptions {
  fields: SetFields;
}
declare function set(input: DateInput, options: SetOptions): Date;
//#endregion
export { SetFields, SetOptions, set };
//# sourceMappingURL=set.d.ts.map