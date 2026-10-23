import { SegmentInfo } from "../getResizeProps.js";
import { Event, Resource, ValidateResizeOptions, ValidateResizeResult } from "../types.js";
import { CalendarFeature } from "./types.js";
import { AvailabilityApi } from "./availability.js";
import { DependencyGraphApi } from "./dependency.js";
import { RecurrenceEditApi, RecurrenceReadApi } from "./recurrence.js";
import { ResizeController, ResizeControllerOptions } from "../resizeController.js";
//#region src/calendar/features/resize.d.ts
interface ResizeFeatureApi<TResource extends Resource, TEvent extends Event<TResource>> {
  createResizeController: (options?: ResizeControllerOptions) => ResizeController<TResource, TEvent>;
  getEventSegmentInfo: (event: TEvent) => SegmentInfo;
  validateResize: (options: ValidateResizeOptions) => ValidateResizeResult;
}
interface ResizePeers<TResource extends Resource, TEvent extends Event<TResource>> {
  recurrence: RecurrenceReadApi<TResource, TEvent> & RecurrenceEditApi<TResource, TEvent>;
  availability?: AvailabilityApi<TResource, TEvent>;
  dependency?: DependencyGraphApi<TResource, TEvent>;
}
declare function eventResizeFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, object, ResizeFeatureApi<TResource, TEvent>, 'resize', ResizePeers<TResource, TEvent>>;
//#endregion
export { ResizeFeatureApi, ResizePeers, eventResizeFeature };
//# sourceMappingURL=resize.d.ts.map