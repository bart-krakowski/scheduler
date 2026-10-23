import { Event, Resource } from "../types.js";
import { CalendarFeature } from "./types.js";
//#region src/calendar/features/filter.d.ts
type EventFilterPredicate<TResource extends Resource, TEvent extends Event<TResource>> = (event: TEvent) => boolean;
interface EventFilterApi<TResource extends Resource, TEvent extends Event<TResource>> {
  setEventFilter: (id: string, predicate: EventFilterPredicate<TResource, TEvent> | null) => void;
  clearEventFilters: () => void;
  getEventFilterIds: () => Array<string>;
  isEventVisible: (event: TEvent) => boolean;
  getHiddenEvents: () => Array<TEvent>;
}
declare function eventFilterFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, object, EventFilterApi<TResource, TEvent>, 'filter'>;
//#endregion
export { EventFilterApi, EventFilterPredicate, eventFilterFeature };
//# sourceMappingURL=filter.d.ts.map