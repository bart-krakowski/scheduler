import { SplittableEvent } from "./splitMultiDay.cjs";
import { Temporal } from "@js-temporal/polyfill";
//#region src/projection/bucketByDay.d.ts
type DayBuckets<E> = Map<string, Array<E>>;
declare function bucketByDay<E extends SplittableEvent>(events: Array<E>, timeZone: Temporal.TimeZoneLike): DayBuckets<E>;
interface DayView<E> {
  isoDate: string;
  events: Array<E>;
  allDayEvents: Array<E>;
  isToday: boolean;
  isInCurrentPeriod: boolean;
}
interface BuildDaysInput<E extends SplittableEvent> {
  isoDates: Array<string>;
  events: Array<E>;
  timeZone: Temporal.TimeZoneLike;
  today?: string;
  isInCurrentPeriod?: (isoDate: string) => boolean;
}
declare function buildDays<E extends SplittableEvent>(input: BuildDaysInput<E>): Array<DayView<E>>;
//#endregion
export { BuildDaysInput, DayBuckets, DayView, bucketByDay, buildDays };
//# sourceMappingURL=bucketByDay.d.cts.map