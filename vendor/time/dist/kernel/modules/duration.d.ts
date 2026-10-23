import { DurationConflict, DurationResourceInput } from "../../validation/duration/checkDuration.js";
//#region src/kernel/modules/duration.d.ts
interface DurationQuery {
  id?: string;
  title: string;
  start: string;
  end: string;
  resources?: Array<DurationResourceInput | string>;
  calendarId?: string;
  duration?: number;
  effort?: number;
}
interface DurationModuleApi {
  evaluateDuration: (event: DurationQuery) => Array<DurationConflict>;
  getWorkingDuration: (range: {
    start: string;
    end: string;
    resources?: Array<DurationResourceInput | string>;
    calendarId?: string;
  }) => number;
}
//#endregion
export { DurationModuleApi, DurationQuery };
//# sourceMappingURL=duration.d.ts.map