import { AvailabilityConflict, AvailabilityResourceInput } from "../../validation/availability/checkAvailability.cjs";
//#region src/kernel/modules/availability.d.ts
interface AvailabilityModuleResource extends AvailabilityResourceInput {}
interface AvailabilityQuery {
  id: string;
  title?: string;
  start: string;
  end: string;
  resources?: Array<AvailabilityModuleResource | string>;
  consumption?: Array<number>;
  calendarId?: string;
}
interface AvailabilityModuleApi {
  evaluateAvailability: (event: AvailabilityQuery) => Array<AvailabilityConflict>;
}
//#endregion
export { AvailabilityModuleApi, AvailabilityModuleResource, AvailabilityQuery };
//# sourceMappingURL=availability.d.cts.map