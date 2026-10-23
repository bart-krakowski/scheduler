import { Event, GetEventProps, Resource } from "../types.js";
import { CalendarFeature } from "./types.js";
//#region src/calendar/features/dayLayout.d.ts
interface DayLayoutApi<TResource extends Resource, TEvent extends Event<TResource>> {
  getEventProps: GetEventProps<TResource, TEvent>;
}
declare function dayEventLayoutFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, object, DayLayoutApi<TResource, TEvent>, 'dayLayout'>;
//#endregion
export { DayLayoutApi, dayEventLayoutFeature };
//# sourceMappingURL=dayLayout.d.ts.map