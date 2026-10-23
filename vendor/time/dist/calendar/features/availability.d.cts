import { AvailabilityConflict } from "../../validation/availability/checkAvailability.cjs";
import { UnavailableRange } from "../../projection/unavailability.cjs";
import "../../projection/index.cjs";
import { UnavailableTimeRange } from "../getResizeProps.cjs";
import { Event, Resource } from "../types.cjs";
import { CalendarFeature } from "./types.cjs";
import { AvailabilityModuleApi } from "../../kernel/modules/availability.cjs";
import "../../kernel/modules/index.cjs";
import { WorkingTimeApi } from "./workingTime.cjs";
//#region src/calendar/features/availability.d.ts
interface UnavailabilityDetail {
  resourceId: string;
  resourceLabel: string;
  reason: 'outside-hours' | 'capacity' | 'no-calendar';
  description: string;
}
interface AvailabilityApi<TResource extends Resource, TEvent extends Event<TResource>> {
  getUnavailableRanges: (date: string, options?: {
    resourceIds?: Array<TResource['id']>;
  }) => Array<UnavailableRange>;
  getUnavailableMinuteRanges: (date: string, options?: {
    resourceIds?: Array<TResource['id']>;
  }) => Array<UnavailableTimeRange>;
  getUnavailabilityDetails: (date: string, startMinutes: number, endMinutes: number, options?: {
    resourceIds?: Array<TResource['id']>;
  }) => Array<UnavailabilityDetail>;
  getDaySpanConflicts: (options: {
    date: string;
    startMinutes: number;
    endMinutes: number;
    eventId: string;
    resourceIds: Array<TResource['id']>;
    event?: TEvent;
  }) => Array<AvailabilityConflict>;
  checkEventAvailability: (event: TEvent, newStart: string, newEnd: string, newResources?: Array<TResource | string>, newConsumption?: Array<number>) => AvailabilityConflict | null;
  validateEventPlacement: (event: {
    id?: string;
    title: string;
    start: string;
    end: string;
    resources?: Array<TResource | string>;
    consumption?: Array<number>;
    calendarId?: string;
  }) => {
    blocked: boolean;
    message?: string;
  };
}
interface AvailabilityPeers<TResource extends Resource> {
  workingTime: WorkingTimeApi<TResource>;
}
declare function resourceAvailabilityFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, AvailabilityModuleApi, AvailabilityApi<TResource, TEvent>, 'availability', AvailabilityPeers<TResource>>;
//#endregion
export { AvailabilityApi, AvailabilityPeers, UnavailabilityDetail, resourceAvailabilityFeature };
//# sourceMappingURL=availability.d.cts.map