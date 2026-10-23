import { DateInput, DateOptions, Range } from "../types.js";
//#region src/date/intersects/intersects.d.ts
interface IntersectsOptions extends DateOptions {
  range: Range;
}
declare function intersects(date: DateInput, options: IntersectsOptions): boolean;
//#endregion
export { IntersectsOptions, intersects };
//# sourceMappingURL=intersects.d.ts.map