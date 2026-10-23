import { DateInput, DateOptions } from "../types.cjs";
//#region src/date/getUnixTime/getUnixTime.d.ts
interface GetUnixTimeOptions extends DateOptions {}
declare function getUnixTime(date: DateInput, options?: GetUnixTimeOptions): number;
//#endregion
export { GetUnixTimeOptions, getUnixTime };
//# sourceMappingURL=getUnixTime.d.cts.map