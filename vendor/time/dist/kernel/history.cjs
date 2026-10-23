const require_types = require('./types.cjs');

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
		if (require_types.isIntentOp(op)) continue;
		inverted.push(invertWriteOp(op));
	}
	return inverted;
}
function concreteWriteOps(ops) {
	return ops.filter((op) => !require_types.isIntentOp(op));
}

//#endregion
exports.concreteWriteOps = concreteWriteOps;
exports.invertWriteOp = invertWriteOp;
exports.invertWriteOps = invertWriteOps;
//# sourceMappingURL=history.cjs.map