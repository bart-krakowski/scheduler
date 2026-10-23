import { isIntentOp } from "./types.js";

//#region src/kernel/history.ts
function invertWriteOp(op) {
	if (op.kind === "add") return {
		kind: "remove",
		id: op.event.id,
		event: op.event
	};
	if (op.kind === "remove") return {
		kind: "add",
		event: op.event
	};
	return {
		kind: "update",
		id: op.id,
		before: op.after,
		after: op.before
	};
}
function invertWriteOps(ops) {
	const inverted = [];
	for (let i = ops.length - 1; i >= 0; i--) {
		const op = ops[i];
		if (isIntentOp(op)) continue;
		inverted.push(invertWriteOp(op));
	}
	return inverted;
}
function concreteWriteOps(ops) {
	return ops.filter((op) => !isIntentOp(op));
}

//#endregion
export { concreteWriteOps, invertWriteOp, invertWriteOps };
//# sourceMappingURL=history.js.map