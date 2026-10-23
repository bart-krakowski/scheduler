import { calculateDeltaMinutesFromPixels } from "./getResizeProps.js";
import { getTimeClient } from "../client/TimeClient.js";
import { snapToInterval } from "./getMoveProps.js";

//#region src/calendar/moveController.ts
const INITIAL_MOVE_STATE = {
	isMoving: false,
	eventId: null,
	granularity: null,
	previewStart: null,
	previewEnd: null,
	lastValidPreviewStart: null,
	lastValidPreviewEnd: null,
	originDayDate: null,
	targetDayDate: null,
	blocked: false
};
const ERROR_THROTTLE_MS = 500;
var MoveController = class {
	constructor(host, options = {}) {
		this._state = INITIAL_MOVE_STATE;
		this._listeners = /* @__PURE__ */ new Set();
		this._original = null;
		this._lastEmittedError = null;
		this._lastProcessed = null;
		this.subscribe = (listener) => {
			this._listeners.add(listener);
			return () => {
				this._listeners.delete(listener);
			};
		};
		this.getSnapshot = () => this._state;
		this._host = host;
		this._options = options;
	}
	setOptions(options) {
		this._options = options;
	}
	getOptions() {
		return this._options;
	}
	start(args) {
		if (!(this._options.enabled ?? true)) return false;
		this._original = {
			id: args.eventId,
			start: args.originalStart,
			end: args.originalEnd,
			dayDate: args.dayDate,
			granularity: args.granularity ?? "time",
			occurrenceStart: args.occurrenceStart,
			recurrenceScope: args.recurrenceScope
		};
		this._lastProcessed = null;
		this._lastEmittedError = null;
		this._replaceState({
			isMoving: true,
			eventId: args.eventId,
			granularity: this._original.granularity,
			previewStart: args.originalStart,
			previewEnd: args.originalEnd,
			lastValidPreviewStart: args.originalStart,
			lastValidPreviewEnd: args.originalEnd,
			originDayDate: args.dayDate,
			targetDayDate: args.dayDate,
			blocked: false
		});
		this._options.onMoveStart?.(args.eventId);
		return true;
	}
	moveTo(args) {
		const original = this._original;
		if (!original) return;
		const constraints = this._options.constraints;
		const targetDayDate = args.dayDate ?? original.dayDate;
		const minuteShift = original.granularity === "day" ? 0 : this._toMinutes(args);
		const snapped = snapToInterval(minuteShift, constraints?.snapToMinutes ?? 15);
		const last = this._lastProcessed;
		if (last && last.minuteShift === snapped && last.day === targetDayDate) return;
		this._lastProcessed = {
			minuteShift: snapped,
			day: targetDayDate
		};
		const validation = this._host.validateEventMove({
			eventId: original.id,
			originalStart: original.start,
			originalEnd: original.end,
			originalDayDate: original.dayDate,
			targetDayDate,
			minuteShift,
			granularity: original.granularity,
			occurrenceStart: original.occurrenceStart,
			constraints
		});
		if (validation.blocked && validation.error) this._maybeEmitError(original.id, original.start, original.end, {
			...validation.error,
			attemptedStart: validation.result.start,
			attemptedEnd: validation.result.end
		});
		else this._lastEmittedError = null;
		const currentState = this._state;
		const previewStart = validation.blocked ? currentState.lastValidPreviewStart ?? original.start : validation.result.start;
		const previewEnd = validation.blocked ? currentState.lastValidPreviewEnd ?? original.end : validation.result.end;
		this._update({
			eventId: original.id,
			previewStart,
			previewEnd,
			...!validation.blocked && {
				lastValidPreviewStart: validation.result.start,
				lastValidPreviewEnd: validation.result.end
			},
			targetDayDate: validation.targetDayDate,
			blocked: validation.blocked
		});
	}
	end() {
		const currentState = this._state;
		const original = this._original;
		this._original = null;
		this._lastProcessed = null;
		this._lastEmittedError = null;
		this._replaceState(INITIAL_MOVE_STATE);
		if (!original) return;
		if (!currentState.previewStart || !currentState.previewEnd) return;
		const newStart = currentState.previewStart;
		const newEnd = currentState.previewEnd;
		if (newStart === original.start && newEnd === original.end) return;
		const emitMoveEnd = () => {
			this._options.onMoveEnd?.(original.id, newStart, newEnd);
		};
		if (original.occurrenceStart != null) {
			if (!original.recurrenceScope && this._options.onRecurringMoveEnd) {
				this._options.onRecurringMoveEnd({
					eventId: original.id,
					occurrenceStart: original.occurrenceStart,
					originalStart: original.start,
					originalEnd: original.end,
					newStart,
					newEnd
				});
				return;
			}
			this._host.editRecurringEvent(original.id, {
				start: newStart,
				end: newEnd
			}, {
				scope: original.recurrenceScope ?? "this",
				occurrenceStart: original.occurrenceStart
			}).then((result) => {
				if (!result.success) {
					this._emitError({
						...result.error,
						kind: "move"
					});
					return;
				}
				emitMoveEnd();
			});
			return;
		}
		this._host.editEvent(this._host.resolveMasterEventId(original.id), {
			start: newStart,
			end: newEnd
		}).then((result) => {
			if (!result.success) {
				this._emitError({
					...result.error,
					kind: "move"
				});
				return;
			}
			emitMoveEnd();
		});
	}
	cancel() {
		this._original = null;
		this._lastProcessed = null;
		this._lastEmittedError = null;
		this._replaceState(INITIAL_MOVE_STATE);
	}
	destroy() {
		this._listeners.clear();
		this._original = null;
		this._lastProcessed = null;
		this._lastEmittedError = null;
		this._state = INITIAL_MOVE_STATE;
	}
	_toMinutes(args) {
		if (args.deltaMinutes !== void 0) return args.deltaMinutes;
		if (args.deltaPixels === void 0) return 0;
		const containerHeight = this._options.containerHeight ?? 0;
		if (containerHeight === 0) return 0;
		return calculateDeltaMinutesFromPixels(args.deltaPixels, containerHeight);
	}
	_notify() {
		for (const listener of this._listeners) listener();
	}
	_update(patch) {
		this._state = {
			...this._state,
			...patch
		};
		this._notify();
	}
	_replaceState(next) {
		this._state = next;
		this._notify();
	}
	_maybeEmitError(eventId, originalStart, originalEnd, error) {
		const now = Date.now();
		const lastError = this._lastEmittedError;
		if (!(!lastError || lastError.eventId !== eventId || lastError.message !== error.message || now - lastError.timestamp > ERROR_THROTTLE_MS)) return;
		const event = this._host.getEvents().find((ev) => ev.id === eventId);
		this._emitError({
			eventId,
			eventTitle: error.eventTitle ?? event?.title ?? "Unknown Event",
			kind: "move",
			reason: error.reason,
			message: error.message,
			originalStart,
			originalEnd,
			attemptedStart: error.attemptedStart,
			attemptedEnd: error.attemptedEnd,
			conflicts: error.conflicts.length > 0 ? error.conflicts : void 0
		});
		this._lastEmittedError = {
			eventId,
			message: error.message,
			timestamp: now
		};
	}
	_emitError(error) {
		getTimeClient().emit("event:update:error", {
			eventId: error.eventId,
			eventTitle: error.eventTitle,
			reason: error.reason,
			message: error.message,
			originalStart: error.originalStart,
			originalEnd: error.originalEnd,
			conflicts: error.conflicts
		});
		this._options.onMoveError?.(error);
	}
};

//#endregion
export { MoveController };
//# sourceMappingURL=moveController.js.map