import { Event, Resource, TimelineLayout } from "../types.cjs";
import { CalendarFeature } from "./types.cjs";
//#region src/calendar/features/timeline.d.ts
interface TimelineApi<TResource extends Resource, TEvent extends Event<TResource>> {
  getEventsByResource: () => Map<TResource['id'], Array<TEvent>>;
  getTimelineLayout: () => TimelineLayout<TResource, TEvent>;
}
declare function timelineFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, object, TimelineApi<TResource, TEvent>, 'timeline'>;
//#endregion
export { TimelineApi, timelineFeature };
//# sourceMappingURL=timeline.d.cts.map