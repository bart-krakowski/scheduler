import { DateOptions } from "../types.cjs";
//#region src/date/fromUnixTime/fromUnixTime.d.ts
interface FromUnixTimeOptions extends DateOptions {}
declare function fromUnixTime(timestamp: number, options?: FromUnixTimeOptions): Date;
//#endregion
export { FromUnixTimeOptions, fromUnixTime };
//# sourceMappingURL=fromUnixTime.d.cts.map