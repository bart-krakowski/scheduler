import { Temporal } from "@js-temporal/polyfill";
//#region src/date/types.d.ts
type DateInput = string | number | Date | Temporal.ZonedDateTime | Temporal.PlainDate;
interface DateOptions {
  calendar?: string;
  timeZone?: string;
}
type DurationLike = Temporal.DurationLike;
interface Range {
  start: DateInput;
  end: DateInput;
}
//#endregion
export { DateInput, DateOptions, DurationLike, Range };
//# sourceMappingURL=types.d.cts.map