import { Event, Resource, ValidateMoveOptions, ValidateMoveResult } from "../types.cjs";
import { CalendarFeature } from "./types.cjs";
import { AvailabilityApi } from "./availability.cjs";
import { RecurrenceEditApi, RecurrenceReadApi } from "./recurrence.cjs";
import { MoveController, MoveControllerOptions } from "../moveController.cjs";
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
//# sourceMappingURL=move.d.cts.map