//#region src/workingTime/types.d.ts
interface RecurrentWorkingInterval {
  weekdays: Array<number>;
  startTime: string;
  endTime: string;
}
interface WorkingInterval {
  isWorking: boolean;
  recurrent?: RecurrentWorkingInterval;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}
interface WorkingCalendar {
  id: string;
  label?: string;
  parentId?: string;
  timeZone?: string;
  intervals: Array<WorkingInterval>;
}
interface WorkingTimeRange {
  start: string;
  end: string;
}
//#endregion
export { RecurrentWorkingInterval, WorkingCalendar, WorkingInterval, WorkingTimeRange };
//# sourceMappingURL=types.d.ts.map