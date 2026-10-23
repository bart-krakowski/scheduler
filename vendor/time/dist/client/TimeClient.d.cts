import { AvailabilityConflict, UnavailabilityReason } from "../calendar/types.cjs";
import { EventClient } from "@tanstack/devtools-event-client";
//#region src/client/TimeClient.d.ts
interface TimeEventInfo {
  eventId: string;
  eventTitle: string;
  start: string;
  end: string;
}
interface TimeEventMap {
  'time:event:added': TimeEventInfo;
  'time:events:set': {
    events: Array<TimeEventInfo>;
  };
  'time:event:updated': TimeEventInfo & {
    updates: Record<string, unknown>;
  };
  'time:event:removed': TimeEventInfo;
  'time:event:undo': {
    added: Array<TimeEventInfo>;
    removed: Array<TimeEventInfo>;
    updated: Array<TimeEventInfo>;
  };
  'time:event:redo': {
    added: Array<TimeEventInfo>;
    removed: Array<TimeEventInfo>;
    updated: Array<TimeEventInfo>;
  };
  'time:event:resized': TimeEventInfo;
  'time:event:update:error': {
    eventId: string;
    eventTitle: string;
    reason: 'unavailable-time' | 'invalid-time' | 'min-duration' | 'blocked';
    message: string;
    originalStart: string;
    originalEnd: string;
    attemptedStart?: string;
    attemptedEnd?: string;
    conflicts?: Array<AvailabilityConflict>;
  };
  'time:calendar:navigate': {
    direction: 'previous' | 'next' | 'current' | 'specific';
    targetDate: string;
  };
  'time:calendar:viewMode:changed': {
    viewMode: {
      value: number;
      unit: string;
    };
  };
}
interface TimeEventRecord {
  type: keyof TimeEventMap;
  payload: TimeEventMap[keyof TimeEventMap];
  timestamp: number;
}
declare class TimeClient extends EventClient<TimeEventMap> {
  private static instance;
  private eventHistory;
  private constructor();
  static getInstance(): TimeClient;
  getEventHistory(): ReadonlyArray<TimeEventRecord>;
}
declare function getTimeClient(): TimeClient;
//#endregion
export { type AvailabilityConflict, TimeEventInfo, TimeEventMap, TimeEventRecord, getTimeClient };
//# sourceMappingURL=TimeClient.d.cts.map