import { TimeAxisLabel } from "./types.cjs";
//#region src/calendar/getTimeAxisLabels.d.ts
interface TimeAxisLabelOptions {
  startHour?: number;
  endHour?: number;
  interval?: number;
}
declare function getTimeAxisLabels(locale: Intl.UnicodeBCP47LocaleIdentifier, options?: TimeAxisLabelOptions): Array<TimeAxisLabel>;
declare const getTimeSlots: typeof getTimeAxisLabels;
//#endregion
export { getTimeAxisLabels, getTimeSlots };
//# sourceMappingURL=getTimeAxisLabels.d.cts.map