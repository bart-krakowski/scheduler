import { DateInput, DateOptions, Range } from "../types.js";
//#region src/date/isBetween/isBetween.d.ts
interface IsBetweenOptions extends DateOptions {
  inclusive?: boolean | 'start' | 'end';
  range: Range;
}
declare function isBetween(date: DateInput, options: IsBetweenOptions): boolean;
//#endregion
export { IsBetweenOptions, isBetween };
//# sourceMappingURL=isBetween.d.ts.map