import { DependencyType, Event, EventDependency, ResizeError, Resource } from "../types.cjs";
import { CalendarFeature } from "./types.cjs";
import { DependencyConflict } from "../../validation/dependency/validateDependencies.cjs";
import "../../validation/dependency/index.cjs";
import { DependencyApi } from "../../kernel/modules/dependency.cjs";
import "../../kernel/modules/index.cjs";
//#region src/calendar/features/dependency.d.ts
interface DependencyShift<TEvent> {
  event: TEvent;
  newStart: string;
  newEnd: string;
}
interface DependencyGraphApi<TResource extends Resource, TEvent extends Event<TResource>> {
  getPredecessorShifts: (eventId: string, newStart: string, newEnd: string) => Array<DependencyShift<TEvent>>;
  getDependentShifts: (eventId: string, newStart: string, newEnd: string) => Array<DependencyShift<TEvent>>;
  getAffectedByDelta: (eventId: string, deltaMs: number) => Array<DependencyShift<TEvent>>;
  findViolatedDependency: (event: TEvent, proposedStartMs: number, proposedEndMs: number) => {
    dependency: EventDependency;
    predecessor: TEvent;
  } | null;
  getAnchorConflicts: (eventId: string, newStart: string, newEnd: string) => Array<DependencyConflict>;
}
interface DependencyCreationApi {
  createDependency: (sourceId: string, targetId: string, type?: DependencyType, lag?: number) => {
    blocked: boolean;
    error?: ResizeError;
  };
}
declare function eventDependencyFeature<TResource extends Resource, TEvent extends Event<TResource>>(): CalendarFeature<TResource, TEvent, DependencyApi, DependencyCreationApi & DependencyApi & DependencyGraphApi<TResource, TEvent>, 'dependency'>;
//#endregion
export { DependencyCreationApi, DependencyGraphApi, DependencyShift, eventDependencyFeature };
//# sourceMappingURL=dependency.d.cts.map