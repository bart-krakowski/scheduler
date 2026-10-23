import { DateInput, DateOptions } from "../types.cjs";
//#region src/date/count/count.d.ts
type CountUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
interface CountOptions extends DateOptions {
  unit: CountUnit;
}
declare function count(start: DateInput, end: DateInput, options: CountOptions): number;
//#endregion
export { CountOptions, CountUnit, count };
//# sourceMappingURL=count.d.cts.map