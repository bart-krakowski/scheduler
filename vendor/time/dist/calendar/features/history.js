import { getTimeClient } from "../../client/TimeClient.js";
import { redoIntent, undoIntent, undoModule } from "../../kernel/modules/undo.js";

//#region src/calendar/features/history.ts
function historyFeature() {
	const diff = (ops) => {
		const toInfo = (event) => ({
			eventId: event.id,
			eventTitle: event.title,
			start: event.start,
			end: event.end
		});
		const added = [];
		const removed = [];
		const updated = [];
		for (const op of ops) {
			if (op.kind === "add") {
				added.push(toInfo(op.event));
				continue;
			}
			if (op.kind === "remove") {
				removed.push(toInfo(op.event));
				continue;
			}
			if (op.before.start !== op.after.start || op.before.end !== op.after.end || op.before.title !== op.after.title) updated.push(toInfo(op.after));
		}
		return {
			added,
			removed,
			updated
		};
	};
	return {
		name: "history",
		module: () => undoModule(),
		api: (host, module) => ({
			undo: () => {
				if (!module.canUndo()) return;
				const applied = host.write([undoIntent()], "history/undo");
				getTimeClient().emit("event:undo", diff(applied));
			},
			redo: () => {
				if (!module.canRedo()) return;
				const applied = host.write([redoIntent()], "history/redo");
				getTimeClient().emit("event:redo", diff(applied));
			},
			canUndo: () => module.canUndo(),
			canRedo: () => module.canRedo()
		})
	};
}

//#endregion
export { historyFeature };
//# sourceMappingURL=history.js.map