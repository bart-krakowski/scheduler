import { DateInput } from "../types.cjs";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.cjs";
import "../withDateOperation/index.cjs";
import { Temporal } from "@js-temporal/polyfill";
//#region src/date/round/round.d.ts
type RoundUnit = 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
type RoundingMode = Temporal.RoundingMode;
interface RoundOptions extends DateOperationOptions {
  unit: RoundUnit;
  roundingMode?: RoundingMode;
  roundingIncrement?: number;
}
declare function round(input: DateInput, options: RoundOptions): Date;
//#endregion
export { RoundOptions, RoundUnit, round };
//# sourceMappingURL=round.d.cts.map