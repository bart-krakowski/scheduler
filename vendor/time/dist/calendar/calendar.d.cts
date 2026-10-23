import { DateInput } from "../date/types.cjs";
import { DateParts, GetDatePartsOptions } from "../date/getDateParts/getDateParts.cjs";
import "../date/index.cjs";
import { LayoutOptions } from "../projection/layout.cjs";
import { WorkingCalendar } from "../workingTime/types.cjs";
import { UnavailableRange } from "../projection/unavailability.cjs";
import "../projection/index.cjs";
import { AvailabilityConflict, CalendarStore, ConstraintType, DateRange, Day, DependencyType, Event, EventDateTimeInput, EventDependency, EventMutationError, EventMutationKind, EventProps, GetEventProps, RecurrenceEditScope, RecurrenceFrequency, RecurrenceOverride, RecurrenceRule, ResizeError, ResizeValidationResult, Resource, SaveEventResult, SchedulingConstraint, TimeAxisLabel, TimeSlot, TimelineEventLayout, TimelineLayout, TimelineResourceRow, UnavailabilityReason, ValidateMoveOptions, ValidateMoveResult, ValidateResizeOptions, ValidateResizeResult, ViewMode } from "./types.cjs";
import { getTimeAxisLabels } from "./getTimeAxisLabels.cjs";
import { SlotRule } from "../slots/types.cjs";
import { CalendarFeatureList } from "./features/calendarFeatures.cjs";
import { ComposedApi } from "./features/registry.cjs";
import "./features/index.cjs";
import { DateCore, DateCoreOptions, FormatPeriodOptions, ParsedDateCoreOptions, PeriodUnit } from "./date-core.cjs";
import { Temporal } from "@js-temporal/polyfill";
//#region src/calendar/calendar.d.ts
interface CalendarCoreOptions<TFeatures extends CalendarFeatureList, TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>> extends DateCoreOptions {
  features: TFeatures;
  events?: Array<NoInfer<TEvent>> | null;
  resources?: Array<TResource> | null;
  calendars?: Array<WorkingCalendar> | null;
  defaultCalendarId?: string;
  multiResource?: 'intersection' | 'union';
  slotRules?: Array<SlotRule> | null;
  fetchEvents?: (range: {
    start: string;
    end: string;
  }) => Promise<Array<NoInfer<TEvent>>>;
  layout?: LayoutOptions;
}
interface CalendarActions<TResource extends Resource, TEvent extends Event<TResource>> {
  goToPreviousPeriod: () => void;
  goToNextPeriod: () => void;
  goToCurrentPeriod: () => void;
  goToSpecificPeriod: (date: string) => void;
  canGoPreviousPeriod: () => boolean;
  canGoNextPeriod: () => boolean;
  changeViewMode: (newViewMode: CalendarStore['viewMode']) => void;
  getDaysNames: (weekday?: 'long' | 'short') => Array<string>;
  groupDaysBy: (props: {
    days: Array<Day<TResource, TEvent> | null>;
    unit: 'week' | 'workWeek';
    fillMissingDays?: boolean;
  }) => Array<Array<Day<TResource, TEvent> | null>>;
  getTimeAxisLabels: (options?: Parameters<typeof getTimeAxisLabels>[1]) => Array<TimeAxisLabel>;
  getTimeSlots: (options?: Parameters<typeof getTimeAxisLabels>[1]) => Array<TimeAxisLabel>;
  getEventsByDate: (date: string) => Array<TEvent>;
  getAllDayEventsByDate: (date: string) => Array<TEvent>;
  addEvent: (event: TEvent, options?: {
    dependsOn?: Array<EventDependency>;
  }) => Promise<SaveEventResult>;
  editEvent: (eventId: string, updates: Partial<Omit<TEvent, 'id'>>, options?: {
    dependsOn?: Array<EventDependency>;
  }) => Promise<SaveEventResult>;
  removeEvent: (id: Event['id']) => void;
  formatPeriodLabel: (options?: {
    locale?: string;
  }) => string;
  formatCurrentPeriod: (options?: {
    locale?: string;
  }) => string;
  formatPeriod: (date?: DateInput, options?: FormatPeriodOptions) => string;
  getDateParts: (date: DateInput, options?: GetDatePartsOptions) => DateParts;
  getDaysInRange: (start: string, end: string) => Array<Day<TResource, TEvent>>;
  getEvents: () => Array<TEvent>;
  validateMove: (eventId: string, newStart: string, newEnd: string, newResources?: Array<TResource | string>, newConsumption?: Array<number>) => {
    blocked: boolean;
    blockedEventTitle?: string;
    message?: string;
  };
  fetchEventsForRange: (start: string, end: string) => Promise<void>;
  setResources: (resources: Array<TResource> | null) => void;
  setEvents: (events: Array<TEvent> | null) => void;
}
interface CalendarState<TResource extends Resource, TEvent extends Event<TResource>> {
  currentPeriod: CalendarStore['currentPeriod'];
  viewMode: CalendarStore['viewMode'];
  days: Array<Day<TResource, TEvent>>;
  activeDate: CalendarStore['activeDate'];
}
type CalendarApi<TFeatures extends CalendarFeatureList, TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>> = CalendarActions<TResource, TEvent> & CalendarState<TResource, TEvent> & ComposedApi<TFeatures, TResource, TEvent>;
type Calendar<TFeatures extends CalendarFeatureList, TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>> = CalendarCore<TFeatures, TResource, TEvent> & ComposedApi<TFeatures, TResource, TEvent>;
type ParsedCalendarCoreOptions<TFeatures extends CalendarFeatureList, TResource extends Resource, TEvent extends Event<TResource>> = ParsedDateCoreOptions & {
  features: TFeatures;
  events: Array<TEvent> | null;
  resources: Array<TResource> | null;
  calendars: Array<WorkingCalendar> | null;
  defaultCalendarId?: string;
  multiResource?: 'intersection' | 'union';
  slotRules?: Array<SlotRule> | null;
  fetchEvents?: (range: {
    start: string;
    end: string;
  }) => Promise<Array<TEvent>>;
  layout?: LayoutOptions;
};
declare class CalendarCore<TFeatures extends CalendarFeatureList, TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>> extends DateCore implements CalendarActions<TResource, TEvent> {
  options: ParsedCalendarCoreOptions<TFeatures, TResource, TEvent>;
  private _eventMap;
  private _dependentsMap;
  private _dateIndex;
  private _loadedRanges;
  private _inFlightFetches;
  private _kernel;
  private _features;
  private get _api();
  get featureApi(): ComposedApi<TFeatures, TResource, TEvent>;
  hasFeature(name: string): boolean;
  private _featureNames;
  private _describeMissingFeatureApi;
  private _eventsCache;
  private _mapVersion;
  private _eventMapCache;
  private _eventMapCacheVersion;
  private _bumpMapVersion;
  constructor(options: CalendarCoreOptions<TFeatures, TResource, TEvent>);
  private _load;
  private _eventsView;
  private _seedKernel;
  private _mountFeatureApi;
  private _assertFeatureRequires;
  private get _availability();
  private get _dependency();
  private get _constraint();
  private _checkAvailability;
  private _checkConstraint;
  private get _duration();
  private _checkDuration;
  private _neighbourBlock;
  private _workingTime;
  private _host;
  private _write;
  private _writeChecked;
  private _conflictError;
  private _eventDateKey;
  private _indexAddEvent;
  private _indexRemoveEvent;
  private _indexUpdateEvent;
  private _isRangeLoaded;
  private _markRangeLoaded;
  private normalizeEvent;
  protected getCalendarDays(): Temporal.PlainDate[];
  private getEventMap;
  private _beginFetch;
  private _endFetch;
  private _indexFetchedEvents;
  private _loadRange;
  ensureRangeLoaded(): void;
  getDaysWithEvents(): {
    isoDate: string;
    isoMonth: string;
    dayOfMonth: number;
    events: TEvent[];
    allDayEvents: TEvent[];
    isToday: boolean;
    isInCurrentPeriod: boolean;
  }[];
  getDaysInRange(start: string, end: string): {
    isoDate: string;
    isoMonth: string;
    dayOfMonth: number;
    events: TEvent[];
    allDayEvents: TEvent[];
    isToday: boolean;
    isInCurrentPeriod: boolean;
  }[];
  private _buildDays;
  getLoadedRanges(): ReadonlyArray<{
    start: string;
    end: string;
  }>;
  fetchEventsForRange(start: string, end: string): Promise<void>;
  formatPeriodLabel(options?: {
    locale?: string;
  }): string;
  formatCurrentPeriod(options?: {
    locale?: string;
  }): string;
  groupDaysBy({ days, unit, fillMissingDays }: {
    days: Array<Day<TResource, TEvent> | null>;
    unit: 'week' | 'workWeek';
    fillMissingDays?: boolean;
  }): (Day<TResource, TEvent> | null)[][];
  getTimeAxisLabels(options?: Parameters<typeof getTimeAxisLabels>[1]): Array<TimeAxisLabel>;
  getTimeSlots(options?: Parameters<typeof getTimeAxisLabels>[1]): Array<TimeAxisLabel>;
  getEventsByDate(date: string): Array<TEvent>;
  getAllDayEventsByDate(date: string): Array<TEvent>;
  private _applyOps;
  private _invalidateEvents;
  commitAdd(event: TEvent): void;
  private _commitAdd;
  commitUpdate(id: Event['id'], updates: Partial<Omit<TEvent, 'id'>>): void;
  private _commitUpdate;
  getEvents(): Array<TEvent>;
  private _normalizeRecurrenceDateTimeInputs;
  validateMove(eventId: string, newStart: string, newEnd: string, newResources?: Array<TResource | string>, newConsumption?: Array<number>): {
    blocked: boolean;
    blockedEventTitle?: string;
    message?: string;
  };
  addEvent(event: TEvent, options?: {
    dependsOn?: Array<EventDependency>;
  }): Promise<SaveEventResult>;
  editEvent(eventId: string, updates: Partial<Omit<TEvent, 'id'>>, options?: {
    dependsOn?: Array<EventDependency>;
  }): Promise<SaveEventResult>;
  removeEvent(id: Event['id']): void;
  setResources(resources: Array<TResource> | null): void;
  setEvents(events: Array<TEvent> | null): void;
}
declare function createCalendar<const TFeatures extends CalendarFeatureList, TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>>(options: CalendarCoreOptions<TFeatures, TResource, TEvent>): Calendar<TFeatures, TResource, TEvent>;
//#endregion
export { type AvailabilityConflict, Calendar, CalendarApi, CalendarCore, CalendarCoreOptions, type CalendarStore, type ConstraintType, DateCore, DateCoreOptions, type DateRange, type Day, type DependencyType, type Event, type EventDateTimeInput, type EventDependency, type EventMutationError, type EventMutationKind, type EventProps, FormatPeriodOptions, type GetEventProps, ParsedDateCoreOptions, PeriodUnit, type RecurrenceEditScope, type RecurrenceFrequency, type RecurrenceOverride, type RecurrenceRule, type ResizeError, type ResizeValidationResult, type Resource, type SaveEventResult, type SchedulingConstraint, type TimeAxisLabel, type TimeSlot, type TimelineEventLayout, type TimelineLayout, type TimelineResourceRow, type UnavailabilityReason, type UnavailableRange, type ValidateMoveOptions, type ValidateMoveResult, type ValidateResizeOptions, type ValidateResizeResult, type ViewMode, createCalendar };
//# sourceMappingURL=calendar.d.cts.map