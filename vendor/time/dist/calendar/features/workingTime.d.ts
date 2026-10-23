import { WorkingTimeRange } from "../../workingTime/types.js";
import { MinuteRange } from "../../workingTime/minutes.js";
import { Event, Resource } from "../types.js";
import { CalendarFeature } from "./types.js";
//#region src/calendar/features/workingTime.d.ts
interface WorkingTimeTarget<TResource extends Resource> {
  resourceId?: TResource['id'];
  resourceIds?: Array<TResource['id']>;
  calendarId?: string;
}
interface WorkingTimeApi<TResource extends Resource> {
  getEffectiveCalendar: (target?: WorkingTimeTarget<TResource>) => string | undefined;
  getWorkingIntervals: (range: WorkingTimeRange, target?: WorkingTimeTarget<TResource>) => Array<WorkingTimeRange>;
  getWorkingMinutes: (date: string, target?: WorkingTimeTarget<TResource>) => Array<MinuteRange>;
  getNonWorkingMinutes: (date: string, target?: WorkingTimeTarget<TResource>) => Array<MinuteRange>;
  isWorkingTime: (range: WorkingTimeRange, target?: WorkingTimeTarget<TResource>) => boolean;
}
declare function workingTimeFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, object, WorkingTimeApi<TResource>, 'workingTime'>;
//#endregion
export { WorkingTimeApi, WorkingTimeTarget, workingTimeFeature };
//# sourceMappingURL=workingTime.d.ts.map