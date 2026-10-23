import { DateInput, DateOptions } from "../types.js";
//#region src/date/isAfter/isAfter.d.ts
interface IsAfterOptions extends DateOptions {}
declare function isAfter(date1: DateInput, date2: DateInput, options?: IsAfterOptions): boolean;
//#endregion
export { IsAfterOptions, isAfter };
//# sourceMappingURL=isAfter.d.ts.map