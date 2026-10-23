import { WorkingCalendar, WorkingInterval } from "./types.js";
//#region src/workingTime/blocks.d.ts
type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
declare function weekday(...days: Array<Weekday | number>): WorkingInterval;
declare function date(isoDate: string): WorkingInterval;
declare function dates(isoDates: Array<string>): Array<WorkingInterval>;
declare function dateRange(start: string, end: string): WorkingInterval;
declare function between(startTime: string, endTime: string): WorkingInterval;
declare function after(startTime: string): WorkingInterval;
declare function before(endTime: string): WorkingInterval;
declare function merge(...fragments: Array<WorkingInterval>): WorkingInterval;
interface ScheduleSpec {
  id: string;
  label?: string;
  parentId?: string;
  timeZone?: string;
  on: Array<WorkingInterval | Array<WorkingInterval>>;
  except?: Array<WorkingInterval | Array<WorkingInterval>>;
}
declare function compileSchedule(spec: ScheduleSpec): WorkingCalendar;
//#endregion
export { ScheduleSpec, Weekday, after, before, between, compileSchedule, date, dateRange, dates, merge, weekday };
//# sourceMappingURL=blocks.d.ts.map