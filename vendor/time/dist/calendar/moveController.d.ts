import { MoveConstraints, MoveGranularity } from "./getMoveProps.js";
import { Event, EventDateTimeInput, EventMutationError, RecurrenceEditScope, Resource, SaveEventResult, ValidateMoveOptions, ValidateMoveResult } from "./types.js";
import { CalendarHost } from "./features/types.js";
import "./features/index.js";
//#region src/calendar/moveController.d.ts
interface MoveHost<TResource extends Resource, TEvent extends Event<TResource>> extends CalendarHost<TResource, TEvent> {
  validateEventMove: (options: ValidateMoveOptions) => ValidateMoveResult;
  resolveMasterEventId: (eventId: string) => string;
  editRecurringEvent: (eventId: string, updates: Partial<Omit<TEvent, 'id'>>, options: {
    scope: RecurrenceEditScope;
    occurrenceStart?: EventDateTimeInput;
  }) => Promise<SaveEventResult>;
}
interface MoveState {
  isMoving: boolean;
  eventId: string | null;
  granularity: MoveGranularity | null;
  previewStart: string | null;
  previewEnd: string | null;
  lastValidPreviewStart: string | null;
  lastValidPreviewEnd: string | null;
  originDayDate: string | null;
  targetDayDate: string | null;
  blocked: boolean;
}
interface MoveControllerOptions {
  enabled?: boolean;
  containerHeight?: number;
  constraints?: MoveConstraints;
  onMoveStart?: (eventId: string) => void;
  onMoveEnd?: (eventId: string, newStart: string, newEnd: string) => void;
  onRecurringMoveEnd?: (move: {
    eventId: string;
    occurrenceStart: EventDateTimeInput;
    originalStart: string;
    originalEnd: string;
    newStart: string;
    newEnd: string;
  }) => void;
  onMoveError?: (error: EventMutationError) => void;
}
interface MoveStartArgs {
  eventId: string;
  originalStart: string;
  originalEnd: string;
  dayDate: string;
  granularity?: MoveGranularity;
  occurrenceStart?: EventDateTimeInput;
  recurrenceScope?: RecurrenceEditScope;
}
interface MoveToArgs {
  dayDate?: string | null;
  deltaMinutes?: number;
  deltaPixels?: number;
}
type MoveListener = () => void;
declare class MoveController<TResource extends Resource, TEvent extends Event<TResource>> {
  private _host;
  private _options;
  private _state;
  private _listeners;
  private _original;
  private _lastEmittedError;
  private _lastProcessed;
  constructor(host: MoveHost<TResource, TEvent>, options?: MoveControllerOptions);
  subscribe: (listener: MoveListener) => (() => void);
  getSnapshot: () => MoveState;
  setOptions(options: MoveControllerOptions): void;
  getOptions(): MoveControllerOptions;
  start(args: MoveStartArgs): boolean;
  moveTo(args: MoveToArgs): void;
  end(): void;
  cancel(): void;
  destroy(): void;
  private _toMinutes;
  private _notify;
  private _update;
  private _replaceState;
  private _maybeEmitError;
  private _emitError;
}
//#endregion
export { MoveController, MoveControllerOptions, MoveHost, MoveListener, MoveStartArgs, MoveState, MoveToArgs };
//# sourceMappingURL=moveController.d.ts.map