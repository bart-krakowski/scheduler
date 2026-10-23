import { DateInput, DateOptions } from "../types.js";
//#region src/date/getUnixTime/getUnixTime.d.ts
interface GetUnixTimeOptions extends DateOptions {}
declare function getUnixTime(date: DateInput, options?: GetUnixTimeOptions): number;
//#endregion
export { GetUnixTimeOptions, getUnixTime };
//# sourceMappingURL=getUnixTime.d.ts.map