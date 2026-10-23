//#region src/kernel/types.ts
function isIntentOp(op) {
	return op.kind === "intent";
}
const PROJECTION_ORDER = [
	"recurrence-expand",
	"clip-to-viewport",
	"filter",
	"layout"
];
const WRITE_TRANSFORM_ORDER = [
	"history-materialize",
	"resize-materialize",
	"recurrence-materialize",
	"schedule"
];
const WRITE_EMIT_STAGE = "emit";
const WRITE_VALIDATE_ORDER = [
	"availability-validate",
	"constraint-validate",
	"duration-validate",
	"dependency-validate"
];

//#endregion
export { PROJECTION_ORDER, WRITE_EMIT_STAGE, WRITE_TRANSFORM_ORDER, WRITE_VALIDATE_ORDER, isIntentOp };
//# sourceMappingURL=types.js.map