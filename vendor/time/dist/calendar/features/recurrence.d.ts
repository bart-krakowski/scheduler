import { Event, EventDateTimeInput, EventDependency, RecurrenceEditScope, Resource, SaveEventResult } from "../types.js";
import { KernelEvent } from "../../kernel/types.js";
import { CalendarFeature } from "./types.js";
import { RecurrenceApi } from "../../kernel/modules/recurrence.js";
import "../../kernel/modules/index.js";
//#region src/calendar/features/recurrence.d.ts
interface RecurrenceNavigationApi {
  goToNextOccurrence: (eventId: string, fromDate?: EventDateTimeInput) => void;
  goToPreviousOccurrence: (eventId: string, fromDate?: EventDateTimeInput) => void;
}
interface RecurrenceEditApi<TResource extends Resource, TEvent extends Event<TResource>> {
  editRecurringEvent: (eventId: string, updates: Partial<Omit<TEvent, 'id'>>, options: {
    scope: RecurrenceEditScope;
    occurrenceStart?: EventDateTimeInput;
    dependsOn?: Array<EventDependency>;
  }) => Promise<SaveEventResult>;
  removeRecurringEvent: (eventId: string, options: {
    scope: RecurrenceEditScope;
    occurrenceStart?: EventDateTimeInput;
  }) => void;
}
interface RecurrenceReadApi<TResource extends Resource, TEvent extends Event<TResource>> {
  getMasterEvent: (event: TEvent) => TEvent;
  resolveOccurrence: (eventId: string, occurrenceStart?: string, fallbackStart?: string) => TEvent | undefined;
}
declare function eventRecurrenceFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, RecurrenceApi<TEvent & KernelEvent>, RecurrenceNavigationApi & RecurrenceEditApi<TResource, TEvent> & RecurrenceReadApi<TResource, TEvent>, 'recurrence'>;
//#endregion
export { RecurrenceEditApi, RecurrenceNavigationApi, RecurrenceReadApi, eventRecurrenceFeature };
//# sourceMappingURL=recurrence.d.ts.map