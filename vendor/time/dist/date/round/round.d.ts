import { DateInput } from "../types.js";
import { DateOperationOptions } from "../withDateOperation/withDateOperation.js";
import "../withDateOperation/index.js";
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
//# sourceMappingURL=round.d.ts.map