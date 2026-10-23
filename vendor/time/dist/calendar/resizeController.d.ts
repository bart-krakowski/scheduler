import { ResizeConstraints, ResizeEdge } from "./getResizeProps.js";
import { Event, EventDateTimeInput, RecurrenceEditScope, ResizeError, Resource, SaveEventResult, ValidateResizeOptions, ValidateResizeResult } from "./types.js";
import { CalendarHost } from "./features/types.js";
import "./features/index.js";
//#region src/calendar/resizeController.d.ts
interface ResizeHost<TResource extends Resource, TEvent extends Event<TResource>> extends CalendarHost<TResource, TEvent> {
  validateResize: (options: ValidateResizeOptions) => ValidateResizeResult;
  editRecurringEvent: (eventId: string, updates: Partial<Omit<TEvent, 'id'>>, options: {
    scope: RecurrenceEditScope;
    occurrenceStart?: EventDateTimeInput;
  }) => Promise<SaveEventResult>;
}
interface ResizeState {
  isResizing: boolean;
  eventId: string | null;
  edge: ResizeEdge | null;
  previewStart: string | null;
  previewEnd: string | null;
  lastValidPreviewStart: string | null;
  lastValidPreviewEnd: string | null;
  targetDayDate: string | null;
  blocked: boolean;
}
interface ResizeControllerOptions {
  enabled?: boolean;
  containerHeight?: number;
  containerWidth?: number;
  orientation?: 'vertical' | 'horizontal';
  constraints?: ResizeConstraints;
  onResizeStart?: (eventId: string, edge: ResizeEdge) => void;
  onResizeEnd?: (eventId: string, newStart: string, newEnd: string) => void;
  onRecurringResizeEnd?: (resize: {
    eventId: string;
    occurrenceStart: EventDateTimeInput;
    originalStart: string;
    originalEnd: string;
    newStart: string;
    newEnd: string;
  }) => void;
  onResizeError?: (error: ResizeError) => void;
}
interface ResizeStartArgs {
  eventId: string;
  edge: ResizeEdge;
  originalStart: string;
  originalEnd: string;
  occurrenceStart?: EventDateTimeInput;
  recurrenceScope?: RecurrenceEditScope;
  clientX: number;
  clientY: number;
  target?: HTMLElement | null;
}
type ResizeListener = () => void;
declare class ResizeController<TResource extends Resource, TEvent extends Event<TResource>> {
  private _host;
  private _options;
  private _state;
  private _listeners;
  private _dayColumns;
  private _dayRects;
  private _original;
  private _lastEmittedError;
  private _lastProcessed;
  private _pendingMouseEvent;
  private _rafId;
  constructor(host: ResizeHost<TResource, TEvent>, options?: ResizeControllerOptions);
  subscribe: (listener: ResizeListener) => (() => void);
  getSnapshot: () => ResizeState;
  setOptions(options: ResizeControllerOptions): void;
  getOptions(): ResizeControllerOptions;
  registerDayColumn(date: string, element: HTMLElement | null): void;
  getDayFromPoint(clientX: number): string | null;
  getDayFromElement(element: HTMLElement): string | null;
  start(args: ResizeStartArgs): boolean;
  cancel(): void;
  destroy(): void;
  handleMouseMove(e: MouseEvent): void;
  handleMouseUp(): void;
  private _refreshDayRects;
  private _cancelPendingFrame;
  private _notify;
  private _update;
  private _replaceState;
  private _processMouseMove;
  private _maybeEmitError;
  private _domListenersAttached;
  private _attachDomListeners;
  private _detachDomListeners;
}
//#endregion
export { ResizeController, ResizeControllerOptions, ResizeHost, ResizeListener, ResizeStartArgs, ResizeState };
//# sourceMappingURL=resizeController.d.ts.map