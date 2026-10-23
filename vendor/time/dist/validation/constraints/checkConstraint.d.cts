//#region src/validation/constraints/checkConstraint.d.ts
type ConstraintType = 'start-no-earlier-than' | 'start-no-later-than' | 'finish-no-earlier-than' | 'finish-no-later-than' | 'must-start-on' | 'must-finish-on';
interface SchedulingConstraint {
  type: ConstraintType;
  date: string;
}
interface ConstraintConflict {
  eventId: string;
  eventTitle: string;
  type: ConstraintType;
  date: string;
  anchor: 'start' | 'finish';
  message: string;
  start: string;
  end: string;
}
//#endregion
export { ConstraintConflict, ConstraintType, SchedulingConstraint };
//# sourceMappingURL=checkConstraint.d.cts.map