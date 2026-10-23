import { ConcreteWriteOp, KernelEvent } from "../types.cjs";
//#region src/kernel/modules/undo.d.ts
interface HistoryEntry<E extends KernelEvent> {
  reason: string;
  ops: Array<ConcreteWriteOp<E>>;
}
interface UndoHistory<E extends KernelEvent> {
  canUndo: () => boolean;
  canRedo: () => boolean;
  undoStack: () => Array<HistoryEntry<E>>;
  redoStack: () => Array<HistoryEntry<E>>;
  clearHistory: () => void;
}
//#endregion
export { HistoryEntry, UndoHistory };
//# sourceMappingURL=undo.d.cts.map