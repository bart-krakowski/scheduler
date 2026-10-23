import { MinuteRange } from "../workingTime/minutes.cjs";
//#region src/projection/unavailability.d.ts
interface UnavailableRange {
  startFraction: number;
  endFraction: number;
  top: string;
  height: string;
  startTime: string;
  endTime: string;
}
declare function toUnavailableRanges(ranges: Array<MinuteRange>): Array<UnavailableRange>;
//#endregion
export { UnavailableRange, toUnavailableRanges };
//# sourceMappingURL=unavailability.d.cts.map