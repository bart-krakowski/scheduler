import { WorkingCalendar } from "../../workingTime/types.cjs";
import { MinuteRange } from "../../workingTime/minutes.cjs";
//#region src/validation/availability/time.d.ts
interface WorkingTimeConfig {
  calendars?: Array<WorkingCalendar> | null;
  defaultCalendarId?: string;
  multiResource?: 'intersection' | 'union';
}
//#endregion
export { type MinuteRange, WorkingTimeConfig };
//# sourceMappingURL=time.d.cts.map