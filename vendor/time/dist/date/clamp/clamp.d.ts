import { DateInput, DateOptions, Range } from "../types.js";
//#region src/date/clamp/clamp.d.ts
interface ClampOptions extends DateOptions {
  range: Range;
}
declare function clamp(input: DateInput, options: ClampOptions): Date;
//#endregion
export { ClampOptions, clamp };
//# sourceMappingURL=clamp.d.ts.map