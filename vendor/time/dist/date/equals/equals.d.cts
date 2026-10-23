import { DateInput, DateOptions } from "../types.cjs";
//#region src/date/equals/equals.d.ts
type EqualsUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
interface EqualsOptions extends DateOptions {}
declare function equals(date1: DateInput, date2: DateInput, unit: EqualsUnit, options?: EqualsOptions): boolean;
//#endregion
export { EqualsOptions, EqualsUnit, equals };
//# sourceMappingURL=equals.d.cts.map