import { DateInput, DateOptions } from "../types.cjs";
//#region src/date/isSameOrAfter/isSameOrAfter.d.ts
type IsSameOrAfterUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
interface IsSameOrAfterOptions extends DateOptions {
  unit: IsSameOrAfterUnit;
}
declare function isSameOrAfter(date1: DateInput, date2: DateInput, options: IsSameOrAfterOptions): boolean;
//#endregion
export { IsSameOrAfterOptions, IsSameOrAfterUnit, isSameOrAfter };
//# sourceMappingURL=isSameOrAfter.d.cts.map