import { Temporal } from "@js-temporal/polyfill";
//#region src/calendar/getMoveProps.d.ts
type MoveGranularity = 'time' | 'day';
interface MoveConstraints {
  snapToMinutes?: number;
}
declare function snapToInterval(minutes: number, interval: number): number;
declare function calculateDayShift(fromDate: string, toDate: string): number;
interface CalculateMovedEventOptions {
  originalStart: string;
  originalEnd: string;
  dayShift?: number;
  minuteShift?: number;
  granularity?: MoveGranularity;
  timeZone: Temporal.TimeZoneLike;
  constraints?: MoveConstraints;
}
interface MovedEventResult {
  start: string;
  end: string;
  durationMinutes: number;
  dayShift: number;
  minuteShift: number;
  moved: boolean;
}
declare function calculateMovedEvent(options: CalculateMovedEventOptions): MovedEventResult;
//#endregion
export { CalculateMovedEventOptions, MoveConstraints, MoveGranularity, MovedEventResult, calculateDayShift, calculateMovedEvent, snapToInterval };
//# sourceMappingURL=getMoveProps.d.cts.map