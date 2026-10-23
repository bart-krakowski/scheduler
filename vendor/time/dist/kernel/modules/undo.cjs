const require_history = require('../history.cjs');

//#region src/kernel/modules/undo.ts
const UNDO_INTENT = "history/undo";
const REDO_INTENT = "history/redo";
function undoIntent() {
	return {
		kind: "intent",
		intent: UNDO_INTENT,
		payload: null
	};
}
function redoIntent() {
	return {
		kind: "intent",
		intent: REDO_INTENT,
		payload: null
	};
}
function undoModule(options = {}) {
	const undone = [];
	const redone = [];
	let pending = null;
	const isHistoryIntent = (op) => op.kind === "intent" && (op.intent === UNDO_INTENT || op.intent === REDO_INTENT);
	const materialize = (batch) => {
		pending = null;
		if (!batch.ops.some(isHistoryIntent)) return batch;
		const ops = [];
		for (const op of batch.ops) {
			if (!isHistoryIntent(op)) {
				ops.push(op);
				continue;
			}
			const undoing = op.intent === UNDO_INTENT;
			const entry = (undoing ? undone : redone).at(-1);
			if (!entry) continue;
			pending = undoing ? {
				kind: "undo",
				entry
			} : {
				kind: "redo",
				entry
			};
			ops.push(...undoing ? require_history.invertWriteOps(entry.ops) : entry.ops);
		}
		return {
			...batch,
			ops,
			replay: true
		};
	};
	const record = (batch) => {
		if (pending?.kind === "undo") {
			undone.pop();
			redone.push(pending.entry);
		} else if (pending?.kind === "redo") {
			redone.pop();
			undone.push(pending.entry);
		} else {
			const ops = require_history.concreteWriteOps(batch.ops);
			if (ops.length > 0) {
				undone.push({
					reason: batch.reason,
					ops
				});
				redone.length = 0;
				if (options.limit !== void 0 && undone.length > options.limit) undone.splice(0, undone.length - options.limit);
			}
		}
		pending = null;
		return batch;
	};
	return {
		name: "undo",
		api: () => ({
			canUndo: () => undone.length > 0,
			canRedo: () => redone.length > 0,
			undoStack: () => [...undone],
			redoStack: () => [...redone],
			clearHistory: () => {
				undone.length = 0;
				redone.length = 0;
				pending = null;
			}
		}),
		contributions: [{
			pipeline: "write",
			kind: "transform",
			stage: "history-materialize",
			priority: options.priority,
			run: materialize
		}, {
			pipeline: "write",
			kind: "transform",
			stage: "emit",
			priority: options.priority,
			run: record
		}]
	};
}

//#endregion
exports.redoIntent = redoIntent;
exports.undoIntent = undoIntent;
exports.undoModule = undoModule;
//# sourceMappingURL=undo.cjs.map