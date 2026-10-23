import { CalendarFeatureFactory } from "./types.cjs";
//#region src/calendar/features/calendarFeatures.d.ts
type CalendarFeatureList = ReadonlyArray<CalendarFeatureFactory>;
declare function calendarFeatures<const TFeatures extends CalendarFeatureList>(features: TFeatures): TFeatures;
//#endregion
export { CalendarFeatureList, calendarFeatures };
//# sourceMappingURL=calendarFeatures.d.cts.map