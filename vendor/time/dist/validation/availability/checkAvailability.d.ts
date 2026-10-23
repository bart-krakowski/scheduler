//#region src/validation/availability/checkAvailability.d.ts
interface AvailabilityResourceInput {
  id: string;
  label: string;
  calendarId?: string;
  capacity?: Array<number>;
}
interface AvailabilityUnavailabilityReason {
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
  resourceDetails: Array<AvailabilityUnavailabilityReason>;
  description: string;
}
//#endregion
export { AvailabilityConflict, AvailabilityResourceInput, AvailabilityUnavailabilityReason };
//# sourceMappingURL=checkAvailability.d.ts.map