import { DateInput, DateOptions } from "../types.cjs";
import { Temporal } from "@js-temporal/polyfill";
//#region src/date/getDateParts/getDateParts.d.ts
interface DateParts {
  calendar: string;
  /** Temporal-backed. Read lazily: non-ISO calendar support depends on the runtime. */
  year: number;
  month: number;
  monthCode: string;
  day: number;
  isLeapMonth: boolean;
  dayOfMonth: string;
  weekdayShort: string;
  weekdayLong: string;
  monthShort: string;
  monthLong: string;
  yearLabel: string;
  yearName?: string;
}
interface GetDatePartsOptions extends DateOptions {
  locale?: Intl.UnicodeBCP47LocaleIdentifier;
}
declare function getDateParts(date: DateInput, options?: GetDatePartsOptions): DateParts;
//#endregion
export { DateParts, GetDatePartsOptions, getDateParts };
//# sourceMappingURL=getDateParts.d.cts.map