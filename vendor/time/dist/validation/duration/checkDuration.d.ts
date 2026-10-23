//#region src/validation/duration/checkDuration.d.ts
interface DurationResourceInput {
  id: string;
  calendarId?: string;
}
interface DurationConflict {
  eventId: string;
  eventTitle: string;
  reason: 'duration-mismatch' | 'effort-exceeds-duration';
  declared: number;
  actual: number;
  message: string;
}
//#endregion
export { DurationConflict, DurationResourceInput };
//# sourceMappingURL=checkDuration.d.ts.map