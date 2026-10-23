import { Event, EventDateTimeInput, Resource } from "../types.js";
import { SlotRule } from "../../slots/types.js";
import { Conflict } from "../../kernel/types.js";
import { CalendarFeature } from "./types.js";
import { WorkingTimeApi } from "./workingTime.js";
//#region src/calendar/features/booking.d.ts
interface BookingSlot {
  ruleId: string;
  start: Date;
  end: Date;
  availableResourceIds: Array<string>;
  remainingCapacity: number;
}
interface BookingRange {
  start: Date;
  end: Date;
}
interface GetSlotsOptions<TResource extends Resource> {
  start: EventDateTimeInput;
  end: EventDateTimeInput;
  now?: EventDateTimeInput;
  ruleIds?: Array<string>;
  resourceIds?: Array<TResource['id']>;
  maxSlots?: number;
}
interface GetSlotsResult {
  slots: Array<BookingSlot>;
  requiredRange: BookingRange;
  unbackedRanges: Array<BookingRange>;
  truncated: boolean;
}
interface BookingPayload<TResource extends Resource> {
  id: string;
  title: string;
  resourceId?: TResource['id'];
  consumption?: Array<number>;
  expiresAt?: EventDateTimeInput;
}
type BookingResult<TEvent> = {
  success: true;
  event: TEvent;
} | {
  success: false;
  conflicts: Array<Conflict>;
};
interface BookingApi<TResource extends Resource, TEvent extends Event<TResource>> {
  getSlotRules: () => Array<SlotRule>;
  getSlots: (options: GetSlotsOptions<TResource>) => GetSlotsResult;
  book: (slot: BookingSlot, payload: BookingPayload<TResource>) => BookingResult<TEvent>;
  hold: (slot: BookingSlot, payload: BookingPayload<TResource> & {
    expiresAt: EventDateTimeInput;
  }) => BookingResult<TEvent>;
}
interface BookingPeers<TResource extends Resource> {
  workingTime: WorkingTimeApi<TResource>;
}
declare function bookingFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, object, BookingApi<TResource, TEvent>, 'booking', BookingPeers<TResource>>;
//#endregion
export { BookingApi, BookingPayload, BookingPeers, BookingRange, BookingResult, BookingSlot, GetSlotsOptions, GetSlotsResult, bookingFeature };
//# sourceMappingURL=booking.d.ts.map