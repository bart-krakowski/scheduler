import { DateInput } from "../date/types.js";
import { DateParts, GetDatePartsOptions } from "../date/getDateParts/getDateParts.js";
import "../date/index.js";
import { CalendarStore, DateRange, ViewMode } from "./types.js";
import { ParsedDateRange } from "../utils/dateRange.js";
import { Temporal } from "@js-temporal/polyfill";
import { Store } from "@tanstack/store";
//#region src/calendar/date-core.d.ts
interface DateCoreOptions {
  viewMode: ViewMode;
  locale?: Intl.UnicodeBCP47LocaleIdentifier;
  timeZone?: Temporal.TimeZoneLike;
  calendar?: Temporal.CalendarLike;
  range?: DateRange;
  dateFormatter?: Intl.DateTimeFormat;
  timeFormatter?: Intl.DateTimeFormat;
  dateTimeFormatter?: Intl.DateTimeFormat;
}
interface ParsedDateCoreOptions extends Omit<Required<DateCoreOptions>, 'range' | 'dateFormatter' | 'timeFormatter' | 'dateTimeFormatter'> {
  range: ParsedDateRange;
}
type PeriodUnit = 'day' | 'month' | 'year';
interface FormatPeriodOptions {
  unit?: PeriodUnit;
  locale?: Intl.UnicodeBCP47LocaleIdentifier;
  calendar?: string;
}
declare abstract class DateCore {
  store: Store<CalendarStore>;
  options: ParsedDateCoreOptions;
  private _dayNamesCache;
  calendarId: string;
  timeZoneId: string;
  formatters: {
    date: Intl.DateTimeFormat;
    time: Intl.DateTimeFormat;
    dateTime: Intl.DateTimeFormat;
  };
  constructor(options: DateCoreOptions);
  protected toPlainDate(isoDate: string): Temporal.PlainDate;
  protected get activeDatePlain(): Temporal.PlainDate;
  protected get currentPeriodPlain(): Temporal.PlainDate;
  getDateParts(date: DateInput, options?: GetDatePartsOptions): DateParts;
  formatPeriod(date?: DateInput, options?: FormatPeriodOptions): string;
  formatDate(date: DateInput): string;
  formatTime(date: DateInput): string;
  formatDateTime(date: DateInput): string;
  protected getFirstDayOfMonth(): Temporal.PlainDate;
  protected getFirstDayOfWeek(): Temporal.PlainDate;
  getWeekStartsOn(): number;
  protected getCalendarDays(): Temporal.PlainDate[];
  getDaysNames(weekday?: 'long' | 'short'): string[];
  changeViewMode(newViewMode: ViewMode): void;
  goToPreviousPeriod(): void;
  goToNextPeriod(): void;
  goToCurrentPeriod(): void;
  goToSpecificPeriod(date: DateInput): void;
  canGoPreviousPeriod(): boolean;
  canGoNextPeriod(): boolean;
}
//#endregion
export { DateCore, DateCoreOptions, FormatPeriodOptions, ParsedDateCoreOptions, PeriodUnit };
//# sourceMappingURL=date-core.d.ts.map