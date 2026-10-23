import { Event, GetEventProps, Resource } from "../types.cjs";
import { CalendarFeature } from "./types.cjs";
//#region src/calendar/features/dayLayout.d.ts
interface DayLayoutApi<TResource extends Resource, TEvent extends Event<TResource>> {
  getEventProps: GetEventProps<TResource, TEvent>;
}
declare function dayEventLayoutFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, object, DayLayoutApi<TResource, TEvent>, 'dayLayout'>;
//#endregion
export { DayLayoutApi, dayEventLayoutFeature };
//# sourceMappingURL=dayLayout.d.cts.map