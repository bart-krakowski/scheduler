import { Event, Resource } from "./types.cjs";
import { Temporal } from "@js-temporal/polyfill";
//#region src/calendar/splitMultiDayEvents.d.ts
declare const splitMultiDayEvents: <TResource extends Resource = Resource, TEvent extends Event<TResource> = Event<TResource>>(event: TEvent, timeZone: Temporal.TimeZoneLike) => Array<TEvent>;
//#endregion
export { splitMultiDayEvents };
//# sourceMappingURL=splitMultiDayEvents.d.cts.map