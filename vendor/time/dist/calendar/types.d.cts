import { DateInput } from "../date/types.cjs";
import "../date/index.cjs";
import { EventLayout, LayoutOptions, LayoutStyle } from "../projection/layout.cjs";
import { UnavailableRange } from "../projection/unavailability.cjs";
import "../projection/index.cjs";
import { MoveConstraints, MoveGranularity } from "./getMoveProps.cjs";
import { ResizeConstraints, ResizeEdge } from "./getResizeProps.cjs";
//#region src/calendar/types.d.ts
type EventDateTimeInput = string | Date | number;
type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';
interface EventDependency {
  id: string;
  type: DependencyType;
  lag?: number;
}
type ConstraintType = 'start-no-earlier-than' | 'start-no-later-than' | 'finish-no-earlier-than' | 'finish-no-later-than' | 'must-start-on' | 'must-finish-on';
interface SchedulingConstraint {
  type: ConstraintType;
  date: string;
}
type RecurrenceEditScope = 'this' | 'thisAndFollowing' | 'all';
interface RecurrenceOverride<TResource extends Resource = Resource> {
  originalStart: EventDateTimeInput;
  id?: string;
  start?: EventDateTimeInput;
  end?: EventDateTimeInput;
  title?: string;
  resources?: Array<TResource | string>;
  consumption?: Array<number>;
  dependsOn?: Array<EventDependency>;
  allDay?: boolean;
  [key: string]: unknown;
}
interface RecurrenceRule<TResource extends Resource = Resource> {
  frequency: RecurrenceFrequency;
  interval?: number;
  until?: string;
  count?: number;
  byWeekday?: Array<number>;
  exDates?: Array<EventDateTimeInput>;
  overrides?: Array<RecurrenceOverride<TResource>>;
}
interface Resource {
  id: string;
  label: string;
  calendarId?: string;
  capacity?: Array<number>;
  buffer?: {
    before?: number;
    after?: number;
  };
}
interface ViewMode {
  value: number;
  unit: 'month' | 'week' | 'day' | 'workWeek';
}
interface Event<TResource extends Resource = Resource> {
  id: string;
  start: EventDateTimeInput;
  end: EventDateTimeInput;
  title: string;
  resources?: Array<TResource | string>;
  consumption?: Array<number>;
  calendarId?: string;
  dependsOn?: Array<EventDependency>;
  manuallyScheduled?: boolean;
  constraint?: SchedulingConstraint;
  duration?: number;
  effort?: number;
  recurrence?: RecurrenceRule<TResource>;
  allDay?: boolean;
  _originalStart?: string;
  _originalEnd?: string;
  _recurringMasterId?: string;
  _occurrenceIndex?: number;
  _occurrenceOriginalStart?: string;
}
type Day<TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>> = {
  isoDate: string;
  isoMonth: string;
  dayOfMonth: number;
  events: Array<TEvent>;
  allDayEvents: Array<TEvent>;
  isToday: boolean;
  isInCurrentPeriod: boolean;
};
interface EventProps<TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>> {
  isSplitEvent: boolean;
  overlappingEvents: Array<TEvent>;
  start: string;
  end: string;
  layout?: EventLayout;
  style?: LayoutStyle;
}
type GetEventProps<TResource extends Resource, TEvent extends Event<TResource>> = (event: TEvent, layoutOptions?: LayoutOptions) => EventProps<TResource, TEvent>;
interface DateRange {
  start: DateInput | null;
  end: DateInput | null;
}
interface TimeAxisLabel {
  hour: number;
  minute: number;
  label: string;
}
interface CalendarStore {
  currentPeriod: string;
  activeDate: string;
  viewMode: ViewMode;
  eventsVersion: number;
  isPending: boolean;
}
interface UnavailabilityReason {
  resourceId: string;
  resourceLabel: string;
  reason: 'outside-hours' | 'capacity' | 'no-calendar';
  description: string;
  capacityInfo?: {
    max: number;
    used: number;
    remaining: number;
  };
}
interface AvailabilityConflict {
  date: string;
  conflictRange: {
    start: string;
    end: string;
  };
  resourceIds: Array<string>;
  resourceDetails: Array<UnavailabilityReason>;
  description: string;
}
type EventMutationKind = 'resize' | 'move';
interface EventMutationError {
  eventId: string;
  eventTitle: string;
  reason: 'unavailable-time' | 'invalid-time' | 'min-duration' | 'blocked';
  message: string;
  originalStart: string;
  originalEnd: string;
  attemptedStart?: string;
  attemptedEnd?: string;
  kind?: EventMutationKind;
  conflicts?: Array<AvailabilityConflict>;
}
type ResizeError = EventMutationError;
interface ResizeValidationResult {
  valid: boolean;
  error?: ResizeError;
}
type SaveEventResult = {
  success: true;
} | {
  success: false;
  error: ResizeError;
};
interface TimelineEventLayout<TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>> {
  event: TEvent;
  left: number;
  width: number;
  lane: number;
  startFraction: number;
  endFraction: number;
  isStartClipped: boolean;
  isEndClipped: boolean;
}
interface TimelineResourceRow<TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>> {
  resource: TResource;
  events: Array<TimelineEventLayout<TResource, TEvent>>;
  laneCount: number;
}
interface TimelineLayout<TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>> {
  rows: Array<TimelineResourceRow<TResource, TEvent>>;
  currentTimePosition: number | null;
}
interface ValidateResizeOptions {
  eventId: string;
  originalStart: string;
  originalEnd: string;
  edge: ResizeEdge;
  totalDeltaMinutes: number;
  targetDayDate: string;
  originalDayDate: string;
  occurrenceStart?: EventDateTimeInput;
  constraints?: ResizeConstraints;
}
interface ValidateResizeResult {
  blocked: boolean;
  error?: {
    reason: ResizeError['reason'];
    message: string;
    conflicts: Array<AvailabilityConflict>;
  };
  result: {
    start: string;
    end: string;
    durationMinutes: number;
  };
  targetDayDate: string;
}
interface ValidateMoveOptions {
  eventId: string;
  originalStart: string;
  originalEnd: string;
  originalDayDate: string;
  targetDayDate: string;
  minuteShift: number;
  granularity?: MoveGranularity;
  occurrenceStart?: EventDateTimeInput;
  constraints?: MoveConstraints;
}
interface ValidateMoveResult {
  blocked: boolean;
  error?: {
    reason: EventMutationError['reason'];
    message: string;
    eventTitle?: string;
    conflicts: Array<AvailabilityConflict>;
  };
  result: {
    start: string;
    end: string;
    durationMinutes: number;
    moved: boolean;
  };
  targetDayDate: string;
}
type TimeSlot = TimeAxisLabel;
//#endregion
export { AvailabilityConflict, CalendarStore, ConstraintType, DateRange, Day, DependencyType, Event, EventDateTimeInput, EventDependency, EventMutationError, EventMutationKind, EventProps, GetEventProps, RecurrenceEditScope, RecurrenceFrequency, RecurrenceOverride, RecurrenceRule, ResizeError, ResizeValidationResult, Resource, SaveEventResult, SchedulingConstraint, TimeAxisLabel, TimeSlot, TimelineEventLayout, TimelineLayout, TimelineResourceRow, UnavailabilityReason, type UnavailableRange, ValidateMoveOptions, ValidateMoveResult, ValidateResizeOptions, ValidateResizeResult, ViewMode };
//# sourceMappingURL=types.d.cts.map