import { CalendarApi, CalendarCoreOptions, CalendarFeatureList, Event, EventDateTimeInput, FeatureName, MoveControllerOptions, MoveStartArgs, MoveState, MoveState as MoveState$1, MoveToArgs, RecurrenceEditScope, ResizeControllerOptions, ResizeEdge, ResizeState, ResizeState as ResizeState$1, Resource } from "@tanstack/time";
//#region src/useCalendar/useCalendar.d.ts
type ResizeOptions = ResizeControllerOptions;
type MoveOptions = MoveControllerOptions;
interface ResizeHandleHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
}
interface ResizeHandleOptions {
  occurrenceStart?: EventDateTimeInput;
  recurrenceScope?: RecurrenceEditScope;
}
interface DayColumnProps {
  ref: (element: HTMLElement | null) => void;
}
interface UseCalendarOptions<TFeatures extends CalendarFeatureList, TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>> extends CalendarCoreOptions<TFeatures, TResource, TEvent> {
  resize?: ResizeOptions;
  move?: MoveOptions;
}
interface ResizeHookApi {
  resizeState: ResizeState;
  getResizeHandleProps: (eventId: string, edge: ResizeEdge, originalStart: string, originalEnd: string, options?: ResizeHandleOptions) => ResizeHandleHandlers;
  getDayColumnProps: (dayDate: string) => DayColumnProps;
}
type ComposedResizeHookApi<TFeatures extends CalendarFeatureList> = 'resize' extends FeatureName<TFeatures[number]> ? ResizeHookApi : object;
interface MoveHookApi {
  moveState: MoveState;
  startEventMove: (args: MoveStartArgs) => boolean;
  updateEventMove: (args: MoveToArgs) => void;
  endEventMove: () => void;
  cancelEventMove: () => void;
}
type ComposedMoveHookApi<TFeatures extends CalendarFeatureList> = 'move' extends FeatureName<TFeatures[number]> ? MoveHookApi : object;
type UseCalendarResult<TFeatures extends CalendarFeatureList, TResource extends Resource, TEvent extends Event<TResource>> = CalendarApi<TFeatures, TResource, TEvent> & {
  isPending: boolean;
} & ComposedResizeHookApi<TFeatures> & ComposedMoveHookApi<TFeatures>;
declare const useCalendar: <const TFeatures extends CalendarFeatureList, TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>>(options: UseCalendarOptions<TFeatures, TResource, TEvent>) => UseCalendarResult<TFeatures, TResource, TEvent>;
//#endregion
export { MoveOptions, type MoveState$1 as MoveState, ResizeOptions, type ResizeState$1 as ResizeState, UseCalendarOptions, useCalendar };
//# sourceMappingURL=useCalendar.d.cts.map