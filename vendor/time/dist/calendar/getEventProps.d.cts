import { EventLayout, LayoutOptions, LayoutOrientation, LayoutStyle } from "../projection/layout.cjs";
import "../projection/index.cjs";
import { CalendarStore, Event, Resource } from "./types.cjs";
import { Temporal } from "@js-temporal/polyfill";
//#region src/calendar/getEventProps.d.ts
interface GetEventPropsOptions extends LayoutOptions {
  timeZone: Temporal.TimeZoneLike;
  orientation?: LayoutOrientation;
  daySegments?: Array<Event>;
}
declare const getEventProps: (eventMap: Map<string, Array<Event>>, event: Event, state: CalendarStore, options: GetEventPropsOptions) => {
  isSplitEvent: boolean;
  overlappingEvents: Event<Resource>[];
  start: string;
  end: string;
} | {
  layout: EventLayout;
  style: LayoutStyle;
  isSplitEvent: boolean;
  overlappingEvents: Event<Resource>[];
  start: string;
  end: string;
};
//#endregion
export { getEventProps };
//# sourceMappingURL=getEventProps.d.cts.map