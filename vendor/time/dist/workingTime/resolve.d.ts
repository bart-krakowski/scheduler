import { WorkingCalendar, WorkingTimeRange } from "./types.js";
//#region src/workingTime/resolve.d.ts
declare function getWorkingTime(calendarId: string | undefined, range: WorkingTimeRange, calendars: Array<WorkingCalendar> | null | undefined): Array<WorkingTimeRange>;
//#endregion
export { getWorkingTime };
//# sourceMappingURL=resolve.d.ts.map