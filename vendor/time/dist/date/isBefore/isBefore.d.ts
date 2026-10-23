import { DateInput, DateOptions } from "../types.js";
//#region src/date/isBefore/isBefore.d.ts
interface IsBeforeOptions extends DateOptions {}
declare function isBefore(date1: DateInput, date2: DateInput, options?: IsBeforeOptions): boolean;
//#endregion
export { IsBeforeOptions, isBefore };
//# sourceMappingURL=isBefore.d.ts.map