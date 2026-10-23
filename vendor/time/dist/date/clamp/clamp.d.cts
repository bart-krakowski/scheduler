import { DateInput, DateOptions, Range } from "../types.cjs";
//#region src/date/clamp/clamp.d.ts
interface ClampOptions extends DateOptions {
  range: Range;
}
declare function clamp(input: DateInput, options: ClampOptions): Date;
//#endregion
export { ClampOptions, clamp };
//# sourceMappingURL=clamp.d.cts.map