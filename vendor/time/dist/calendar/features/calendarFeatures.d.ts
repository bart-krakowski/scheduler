import { CalendarFeatureFactory } from "./types.js";
//#region src/calendar/features/calendarFeatures.d.ts
type CalendarFeatureList = ReadonlyArray<CalendarFeatureFactory>;
declare function calendarFeatures<const TFeatures extends CalendarFeatureList>(features: TFeatures): TFeatures;
//#endregion
export { CalendarFeatureList, calendarFeatures };
//# sourceMappingURL=calendarFeatures.d.ts.map