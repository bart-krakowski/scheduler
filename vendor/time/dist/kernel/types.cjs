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
exports.PROJECTION_ORDER = PROJECTION_ORDER;
exports.WRITE_EMIT_STAGE = WRITE_EMIT_STAGE;
exports.WRITE_TRANSFORM_ORDER = WRITE_TRANSFORM_ORDER;
exports.WRITE_VALIDATE_ORDER = WRITE_VALIDATE_ORDER;
exports.isIntentOp = isIntentOp;
//# sourceMappingURL=types.cjs.map