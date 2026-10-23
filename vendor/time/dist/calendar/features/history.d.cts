import { Event, Resource } from "../types.cjs";
import { KernelEvent } from "../../kernel/types.cjs";
import { CalendarFeature } from "./types.cjs";
import { UndoHistory } from "../../kernel/modules/undo.cjs";
import "../../kernel/modules/index.cjs";
//#region src/calendar/features/history.d.ts
interface HistoryApi {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
declare function historyFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, UndoHistory<TEvent & KernelEvent>, HistoryApi, 'history'>;
//#endregion
export { HistoryApi, historyFeature };
//# sourceMappingURL=history.d.cts.map