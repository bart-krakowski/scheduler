import { Event, Resource, ValidateMoveOptions, ValidateMoveResult } from "../types.js";
import { CalendarFeature } from "./types.js";
import { AvailabilityApi } from "./availability.js";
import { RecurrenceEditApi, RecurrenceReadApi } from "./recurrence.js";
import { MoveController, MoveControllerOptions } from "../moveController.js";
//#region src/calendar/features/move.d.ts
interface MoveFeatureApi<TResource extends Resource, TEvent extends Event<TResource>> {
  createMoveController: (options?: MoveControllerOptions) => MoveController<TResource, TEvent>;
  validateEventMove: (options: ValidateMoveOptions) => ValidateMoveResult;
}
interface MovePeers<TResource extends Resource, TEvent extends Event<TResource>> {
  recurrence: RecurrenceReadApi<TResource, TEvent> & RecurrenceEditApi<TResource, TEvent>;
  availability?: AvailabilityApi<TResource, TEvent>;
}
declare function eventMoveFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, object, MoveFeatureApi<TResource, TEvent>, 'move', MovePeers<TResource, TEvent>>;
//#endregion
export { MoveFeatureApi, MovePeers, eventMoveFeature };
//# sourceMappingURL=move.d.ts.map