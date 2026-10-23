import { DateInput, DateOptions } from "../types.js";
import { DateFormatterBuildParams, DateTimeFormatterBuildParams, TimeFormatterBuildParams } from "../../formatter/shared.js";
//#region src/date/format/format.d.ts
type FormatType = 'date' | 'time' | 'datetime';
interface FormatDateOptions extends DateOptions {
  type?: FormatType;
  locale?: string | Intl.Locale | Array<string> | Array<Intl.Locale>;
  options?: string | DateFormatterBuildParams['options'] | TimeFormatterBuildParams['options'] | DateTimeFormatterBuildParams['options'];
}
declare function format(date: DateInput, formatOptions?: FormatDateOptions): string;
//#endregion
export { FormatDateOptions, FormatType, format };
//# sourceMappingURL=format.d.ts.map