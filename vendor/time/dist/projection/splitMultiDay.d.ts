import { Temporal } from "@js-temporal/polyfill";
//#region src/projection/splitMultiDay.d.ts
interface SplittableEvent {
  id: string;
  start: string | Date | number;
  end: string | Date | number;
  allDay?: boolean;
  _originalStart?: string | Date | number;
  _originalEnd?: string | Date | number;
}
declare function splitMultiDay<E extends SplittableEvent>(event: E, timeZone: Temporal.TimeZoneLike): Array<E>;
declare function spansMultipleDays(event: SplittableEvent): boolean;
declare function splitEventsByDay<E extends SplittableEvent>(events: Array<E>, timeZone: Temporal.TimeZoneLike): Array<E>;
//#endregion
export { SplittableEvent, spansMultipleDays, splitEventsByDay, splitMultiDay };
//# sourceMappingURL=splitMultiDay.d.ts.map