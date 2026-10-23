import { WorkingCalendar } from "../../workingTime/types.js";
import { MinuteRange } from "../../workingTime/minutes.js";
//#region src/validation/availability/time.d.ts
interface WorkingTimeConfig {
  calendars?: Array<WorkingCalendar> | null;
  defaultCalendarId?: string;
  multiResource?: 'intersection' | 'union';
}
//#endregion
export { type MinuteRange, WorkingTimeConfig };
//# sourceMappingURL=time.d.ts.map