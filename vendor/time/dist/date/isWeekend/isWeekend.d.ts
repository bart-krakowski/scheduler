import { DateInput, DateOptions } from "../types.js";
//#region src/date/isWeekend/isWeekend.d.ts
interface IsWeekendOptions extends DateOptions {
  locale?: string;
}
declare function isWeekend(date: DateInput, options?: IsWeekendOptions): boolean;
//#endregion
export { IsWeekendOptions, isWeekend };
//# sourceMappingURL=isWeekend.d.ts.map