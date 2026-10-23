import { DateInput, DateOptions } from "../types.cjs";
//#region src/date/isSameOrBefore/isSameOrBefore.d.ts
type IsSameOrBeforeUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
interface IsSameOrBeforeOptions extends DateOptions {
  unit: IsSameOrBeforeUnit;
}
declare function isSameOrBefore(date1: DateInput, date2: DateInput, options: IsSameOrBeforeOptions): boolean;
//#endregion
export { IsSameOrBeforeOptions, IsSameOrBeforeUnit, isSameOrBefore };
//# sourceMappingURL=isSameOrBefore.d.cts.map