import { WorkingCalendar, WorkingTimeRange } from "../workingTime/types.js";
//#region src/slots/types.d.ts
interface SlotRule {
  id: string;
  calendarId: string;
  duration: number;
  step?: number;
  bufferBefore?: number;
  bufferAfter?: number;
  minNotice?: number;
  minNoticeIsWorkingTime?: boolean;
  maxHorizon?: number;
  resourceIds?: Array<string>;
  capacity?: number;
}
interface SlotResource {
  id: string;
  capacity?: Array<number>;
  buffer?: {
    before?: number;
    after?: number;
  };
}
interface SlotOccupyingEvent {
  id: string;
  start: string;
  end: string;
  resourceIds?: Array<string>;
  consumption?: Array<number>;
  expiresAt?: string;
}
interface Slot {
  ruleId: string;
  start: string;
  end: string;
  startEpochMs: number;
  endEpochMs: number;
  availableResourceIds: Array<string>;
  remainingCapacity: number;
}
interface GenerateSlotsInput {
  rules: Array<SlotRule>;
  range: WorkingTimeRange;
  now: string;
  timeZone: string;
  calendars?: Array<WorkingCalendar> | null;
  resources?: Array<SlotResource> | null;
  events?: Array<SlotOccupyingEvent> | null;
  maxSlots?: number;
}
interface GenerateSlotsResult {
  slots: Array<Slot>;
  requiredRange: WorkingTimeRange;
  truncated: boolean;
}
//#endregion
export { GenerateSlotsInput, GenerateSlotsResult, Slot, SlotOccupyingEvent, SlotResource, SlotRule };
//# sourceMappingURL=types.d.ts.map