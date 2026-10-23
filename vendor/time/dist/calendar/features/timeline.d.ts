import { Event, Resource, TimelineLayout } from "../types.js";
import { CalendarFeature } from "./types.js";
//#region src/calendar/features/timeline.d.ts
interface TimelineApi<TResource extends Resource, TEvent extends Event<TResource>> {
  getEventsByResource: () => Map<TResource['id'], Array<TEvent>>;
  getTimelineLayout: () => TimelineLayout<TResource, TEvent>;
}
declare function timelineFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, object, TimelineApi<TResource, TEvent>, 'timeline'>;
//#endregion
export { TimelineApi, timelineFeature };
//# sourceMappingURL=timeline.d.ts.map