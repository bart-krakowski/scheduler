import { Event, Resource } from "../types.js";
import { KernelEvent } from "../../kernel/types.js";
import { CalendarFeature } from "./types.js";
import { UndoHistory } from "../../kernel/modules/undo.js";
import "../../kernel/modules/index.js";
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
//# sourceMappingURL=history.d.ts.map