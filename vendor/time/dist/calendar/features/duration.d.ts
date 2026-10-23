import { Event, Resource } from "../types.js";
import { CalendarFeature } from "./types.js";
import { DurationConflict } from "../../validation/duration/checkDuration.js";
import { DurationModuleApi } from "../../kernel/modules/duration.js";
import "../../kernel/modules/index.js";
//#region src/calendar/features/duration.d.ts
interface DurationApi<TResource extends Resource, TEvent extends Event<TResource>> {
  getWorkingDuration: (event: TEvent, newStart?: string, newEnd?: string) => number;
  checkEventDuration: (event: TEvent, newStart?: string, newEnd?: string, newResources?: Array<TResource | string>) => Array<DurationConflict>;
}
declare function eventDurationFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, DurationModuleApi, DurationApi<TResource, TEvent>, 'duration'>;
//#endregion
export { DurationApi, eventDurationFeature };
//# sourceMappingURL=duration.d.ts.map