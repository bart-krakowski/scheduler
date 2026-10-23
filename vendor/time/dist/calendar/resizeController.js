import { calculateDeltaMinutesFromPixels, calculateDeltaMinutesFromPixelsHorizontal } from "./getResizeProps.js";
import { getTimeClient } from "../client/TimeClient.js";

//#region src/calendar/resizeController.ts
const INITIAL_RESIZE_STATE = {
	isResizing: false,
	eventId: null,
	edge: null,
	previewStart: null,
	previewEnd: null,
	lastValidPreviewStart: null,
	lastValidPreviewEnd: null,
	targetDayDate: null,
	blocked: false
};
const MS_PER_DAY = 864e5;
var ResizeController = class {
	constructor(host, options = {}) {
		this._state = INITIAL_RESIZE_STATE;
		this._listeners = /* @__PURE__ */ new Set();
		this._dayColumns = /* @__PURE__ */ new Map();
		this._dayRects = [];
		this._original = null;
		this._lastEmittedError = null;
		this._lastProcessed = null;
		this._pendingMouseEvent = null;
		this._rafId = null;
		this.subscribe = (listener) => {
			this._listeners.add(listener);
			return () => {
				this._listeners.delete(listener);
			};
		};
		this.getSnapshot = () => this._state;
		this._domListenersAttached = false;
		this._host = host;
		this._options = options;
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);
	}
	setOptions(options) {
		this._options = options;
	}
	getOptions() {
		return this._options;
	}
	registerDayColumn(date, element) {
		if (element) this._dayColumns.set(date, element);
		else this._dayColumns.delete(date);
	}
	getDayFromPoint(clientX) {
		const cached = this._dayRects;
		if (cached.length > 0) {
			for (const r of cached) if (clientX >= r.left && clientX <= r.right) return r.date;
			return null;
		}
		for (const [dayDate, element] of this._dayColumns) {
			const rect = element.getBoundingClientRect();
			if (clientX >= rect.left && clientX <= rect.right) return dayDate;
		}
		return null;
	}
	getDayFromElement(element) {
		for (const [dayDate, dayElement] of this._dayColumns) if (dayElement.contains(element)) return dayDate;
		return null;
	}
	start(args) {
		if (!(this._options.enabled ?? true)) return false;
		const dayDate = (args.target ? this.getDayFromElement(args.target) : null) ?? this.getDayFromPoint(args.clientX);
		if (!dayDate) return false;
		this._original = {
			id: args.eventId,
			start: args.originalStart,
			end: args.originalEnd,
			occurrenceStart: args.occurrenceStart,
			recurrenceScope: args.recurrenceScope,
			edge: args.edge,
			startY: args.clientY,
			startX: args.clientX,
			originalDayDate: dayDate,
			currentDayDate: dayDate,
			totalDaysInView: this._host.getDaysWithEvents().length
		};
		this._refreshDayRects();
		this._lastProcessed = null;
		this._update({
			isResizing: true,
			eventId: args.eventId,
			edge: args.edge,
			previewStart: args.originalStart,
			previewEnd: args.originalEnd,
			lastValidPreviewStart: args.originalStart,
			lastValidPreviewEnd: args.originalEnd,
			targetDayDate: dayDate
		});
		this._options.onResizeStart?.(args.eventId, args.edge);
		this._attachDomListeners();
		return true;
	}
	cancel() {
		this._cancelPendingFrame();
		this._detachDomListeners();
		this._original = null;
		this._lastEmittedError = null;
		this._lastProcessed = null;
		this._dayRects = [];
		this._replaceState(INITIAL_RESIZE_STATE);
	}
	destroy() {
		this._cancelPendingFrame();
		this._detachDomListeners();
		this._listeners.clear();
		this._dayColumns.clear();
		this._dayRects = [];
		this._original = null;
		this._lastEmittedError = null;
		this._lastProcessed = null;
		this._state = INITIAL_RESIZE_STATE;
	}
	handleMouseMove(e) {
		this._pendingMouseEvent = e;
		if (this._rafId !== null) return;
		this._rafId = requestAnimationFrame(() => {
			this._rafId = null;
			const ev = this._pendingMouseEvent;
			this._pendingMouseEvent = null;
			if (ev) this._processMouseMove(ev);
		});
	}
	handleMouseUp() {
		this._cancelPendingFrame();
		this._detachDomListeners();
		this._lastProcessed = null;
		this._dayRects = [];
		const currentState = this._state;
		const original = this._original;
		if (currentState.eventId && currentState.previewStart && currentState.previewEnd) {
			if (!original || currentState.previewStart !== original.start || currentState.previewEnd !== original.end) {
				const emitResizeEnd = () => {
					this._options.onResizeEnd?.(currentState.eventId, currentState.previewStart, currentState.previewEnd);
				};
				const commitRecurringResize = (scope) => {
					this._host.editRecurringEvent(currentState.eventId, {
						start: currentState.previewStart,
						end: currentState.previewEnd
					}, {
						scope,
						occurrenceStart: original.occurrenceStart
					}).then((result) => {
						if (!result.success) {
							this._options.onResizeError?.(result.error);
							return;
						}
						emitResizeEnd();
					});
				};
				if (original?.occurrenceStart != null) {
					if (!original.recurrenceScope && this._options.onRecurringResizeEnd) this._options.onRecurringResizeEnd({
						eventId: currentState.eventId,
						occurrenceStart: original.occurrenceStart,
						originalStart: original.start,
						originalEnd: original.end,
						newStart: currentState.previewStart,
						newEnd: currentState.previewEnd
					});
					else commitRecurringResize(original.recurrenceScope ?? "this");
				} else {
					this._host.commitUpdate(currentState.eventId, {
						start: currentState.previewStart,
						end: currentState.previewEnd
					});
					emitResizeEnd();
				}
			}
		}
		this._original = null;
		this._lastEmittedError = null;
		this._replaceState(INITIAL_RESIZE_STATE);
	}
	_refreshDayRects() {
		const arr = [];
		for (const [dayDate, element] of this._dayColumns) {
			const rect = element.getBoundingClientRect();
			arr.push({
				date: dayDate,
				left: rect.left,
				right: rect.right
			});
		}
		this._dayRects = arr;
	}
	_cancelPendingFrame() {
		if (this._rafId !== null) {
			cancelAnimationFrame(this._rafId);
			this._rafId = null;
		}
		this._pendingMouseEvent = null;
	}
	_notify() {
		for (const l of this._listeners) l();
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
	_processMouseMove(e) {
		const original = this._original;
		if (!original) return;
		const opts = this._options;
		const containerHeight = opts.containerHeight ?? 0;
		const containerWidth = opts.containerWidth ?? 0;
		const orientation = opts.orientation ?? "vertical";
		const constraints = opts.constraints;
		const { id, start, end, edge, startY, startX, originalDayDate } = original;
		let targetDayDate;
		let totalDeltaMinutes;
		if (orientation === "horizontal") {
			if (containerWidth === 0) return;
			const totalMinutesInView = original.totalDaysInView * 24 * 60;
			totalDeltaMinutes = calculateDeltaMinutesFromPixelsHorizontal(e.clientX - startX, containerWidth, totalMinutesInView);
			targetDayDate = originalDayDate;
		} else {
			const deltaMinutes = calculateDeltaMinutesFromPixels(e.clientY - startY, containerHeight);
			targetDayDate = this.getDayFromPoint(e.clientX) ?? originalDayDate;
			let dayOffsetMinutes = 0;
			if (targetDayDate !== originalDayDate) {
				const originalDate = /* @__PURE__ */ new Date(originalDayDate + "T00:00:00");
				const targetDate = /* @__PURE__ */ new Date(targetDayDate + "T00:00:00");
				dayOffsetMinutes = Math.round((targetDate.getTime() - originalDate.getTime()) / MS_PER_DAY) * 24 * 60;
				original.currentDayDate = targetDayDate;
			}
			totalDeltaMinutes = deltaMinutes + dayOffsetMinutes;
		}
		const snapToMinutes = constraints?.snapToMinutes ?? 1;
		const snappedDelta = snapToMinutes > 1 ? Math.round(totalDeltaMinutes / snapToMinutes) * snapToMinutes : totalDeltaMinutes;
		const last = this._lastProcessed;
		if (last && last.delta === snappedDelta && last.day === targetDayDate) return;
		this._lastProcessed = {
			delta: snappedDelta,
			day: targetDayDate
		};
		const validation = this._host.validateResize({
			eventId: id,
			originalStart: start,
			originalEnd: end,
			edge,
			totalDeltaMinutes,
			targetDayDate,
			originalDayDate,
			occurrenceStart: original.occurrenceStart,
			constraints
		});
		if (validation.blocked && validation.error) this._maybeEmitError(id, start, end, validation.error);
		else this._lastEmittedError = null;
		const currentState = this._state;
		const effectivePreviewStart = validation.blocked ? currentState.lastValidPreviewStart ?? start : validation.result.start;
		const effectivePreviewEnd = validation.blocked ? currentState.lastValidPreviewEnd ?? end : validation.result.end;
		this._update({
			eventId: id,
			previewStart: effectivePreviewStart,
			previewEnd: effectivePreviewEnd,
			...!validation.blocked && {
				lastValidPreviewStart: validation.result.start,
				lastValidPreviewEnd: validation.result.end
			},
			targetDayDate: validation.targetDayDate,
			blocked: validation.blocked
		});
	}
	_maybeEmitError(eventId, originalStart, originalEnd, error) {
		const now = Date.now();
		const lastError = this._lastEmittedError;
		if (!(!lastError || lastError.eventId !== eventId || lastError.message !== error.message || now - lastError.timestamp > 500)) return;
		const eventTitle = this._host.getEvents().find((ev) => ev.id === eventId)?.title ?? "Unknown Event";
		const conflicts = error.conflicts.length > 0 ? error.conflicts : void 0;
		const resizeError = {
			eventId,
			eventTitle,
			reason: error.reason,
			message: error.message,
			originalStart,
			originalEnd,
			conflicts
		};
		getTimeClient().emit("event:update:error", {
			eventId,
			eventTitle,
			reason: error.reason,
			message: error.message,
			originalStart,
			originalEnd,
			conflicts
		});
		this._options.onResizeError?.(resizeError);
		this._lastEmittedError = {
			eventId,
			message: error.message,
			timestamp: now
		};
	}
	_attachDomListeners() {
		if (this._domListenersAttached) return;
		if (typeof document === "undefined") return;
		document.addEventListener("mousemove", this.handleMouseMove);
		document.addEventListener("mouseup", this.handleMouseUp);
		this._domListenersAttached = true;
	}
	_detachDomListeners() {
		if (!this._domListenersAttached) return;
		if (typeof document === "undefined") return;
		document.removeEventListener("mousemove", this.handleMouseMove);
		document.removeEventListener("mouseup", this.handleMouseUp);
		this._domListenersAttached = false;
	}
};

//#endregion
export { ResizeController };
//# sourceMappingURL=resizeController.js.map