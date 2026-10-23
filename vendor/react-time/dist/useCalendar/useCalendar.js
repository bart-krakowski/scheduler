import { inertMoveController } from "./inertMoveController.js";
import { inertResizeController } from "./inertResizeController.js";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useStore } from "@tanstack/react-store";
import { createCalendar } from "@tanstack/time";

//#region src/useCalendar/useCalendar.ts
const useCalendar = (options) => {
	const { resize, move, ...calendarOptions } = options;
	const [calendarCore] = useState(() => createCalendar(calendarOptions));
	const state = useStore(calendarCore.store);
	const isPending = state.isPending;
	useEffect(() => {
		calendarCore.ensureRangeLoaded();
	}, [
		calendarCore,
		state.currentPeriod,
		state.viewMode,
		state.activeDate
	]);
	const [resizeController] = useState(() => calendarCore.hasFeature("resize") ? calendarCore.createResizeController(resize) : inertResizeController());
	useEffect(() => {
		resizeController.setOptions(resize ?? {});
	}, [resizeController, resize]);
	useEffect(() => {
		return () => {
			resizeController.destroy();
		};
	}, [resizeController]);
	const resizeState = useSyncExternalStore(resizeController.subscribe, resizeController.getSnapshot, resizeController.getSnapshot);
	const [moveController] = useState(() => calendarCore.hasFeature("move") ? calendarCore.createMoveController(move) : inertMoveController());
	useEffect(() => {
		moveController.setOptions(move ?? {});
	}, [moveController, move]);
	useEffect(() => {
		return () => {
			moveController.destroy();
		};
	}, [moveController]);
	const moveState = useSyncExternalStore(moveController.subscribe, moveController.getSnapshot, moveController.getSnapshot);
	const startEventMove = useCallback((args) => moveController.start(args), [moveController]);
	const updateEventMove = useCallback((args) => {
		moveController.moveTo(args);
	}, [moveController]);
	const endEventMove = useCallback(() => {
		moveController.end();
	}, [moveController]);
	const cancelEventMove = useCallback(() => {
		moveController.cancel();
	}, [moveController]);
	const resizeHandlePropsCacheRef = useRef(/* @__PURE__ */ new Map());
	const dayColumnPropsCacheRef = useRef(/* @__PURE__ */ new Map());
	const getResizeHandleProps = useCallback((eventId, edge, originalStart, originalEnd, handleOptions) => {
		const key = `${eventId}|${edge}|${originalStart}|${originalEnd}|${handleOptions?.occurrenceStart ?? ""}|${handleOptions?.recurrenceScope ?? ""}`;
		const cache = resizeHandlePropsCacheRef.current;
		const cached = cache.get(key);
		if (cached) return cached;
		const handlers = { onMouseDown: (e) => {
			if (!resizeController.start({
				eventId,
				edge,
				originalStart,
				originalEnd,
				occurrenceStart: handleOptions?.occurrenceStart,
				recurrenceScope: handleOptions?.recurrenceScope,
				clientX: e.clientX,
				clientY: e.clientY,
				target: e.target
			})) return;
			e.preventDefault();
			e.stopPropagation();
		} };
		cache.set(key, handlers);
		return handlers;
	}, [resizeController]);
	const getDayColumnProps = useCallback((dayDate) => {
		const cache = dayColumnPropsCacheRef.current;
		const cached = cache.get(dayDate);
		if (cached) return cached;
		const props = { ref: (element) => {
			resizeController.registerDayColumn(dayDate, element);
		} };
		cache.set(dayDate, props);
		return props;
	}, [resizeController]);
	const goToPreviousPeriod = useCallback(() => {
		calendarCore.goToPreviousPeriod();
	}, [calendarCore]);
	const goToNextPeriod = useCallback(() => {
		calendarCore.goToNextPeriod();
	}, [calendarCore]);
	const goToCurrentPeriod = useCallback(() => {
		calendarCore.goToCurrentPeriod();
	}, [calendarCore]);
	const goToSpecificPeriod = useCallback((date) => {
		calendarCore.goToSpecificPeriod(date);
	}, [calendarCore]);
	const changeViewMode = useCallback((newViewMode) => {
		calendarCore.changeViewMode(newViewMode);
	}, [calendarCore]);
	const groupDaysBy = useCallback((props) => calendarCore.groupDaysBy(props), [calendarCore]);
	const getDaysNames = useCallback((props) => calendarCore.getDaysNames(props), [calendarCore]);
	const getTimeAxisLabels = useCallback((labelOptions) => calendarCore.getTimeAxisLabels(labelOptions), [calendarCore]);
	const getEventsByDate = useCallback((date) => calendarCore.getEventsByDate(date), [calendarCore]);
	const getAllDayEventsByDate = useCallback((date) => calendarCore.getAllDayEventsByDate(date), [calendarCore]);
	const canGoPreviousPeriod = useCallback(() => calendarCore.canGoPreviousPeriod(), [calendarCore]);
	const canGoNextPeriod = useCallback(() => calendarCore.canGoNextPeriod(), [calendarCore]);
	const addEvent = useCallback((event, addOptions) => calendarCore.addEvent(event, addOptions), [calendarCore]);
	const editEvent = useCallback((eventId, updates, editOptions) => calendarCore.editEvent(eventId, updates, editOptions), [calendarCore]);
	const removeEvent = useCallback((id) => calendarCore.removeEvent(id), [calendarCore]);
	const getEvents = useCallback(() => calendarCore.getEvents(), [calendarCore]);
	const validateMove = useCallback((eventId, newStart, newEnd, newResources) => calendarCore.validateMove(eventId, newStart, newEnd, newResources), [calendarCore]);
	const fetchEventsForRange = useCallback((start, end) => calendarCore.fetchEventsForRange(start, end), [calendarCore]);
	const formatPeriodLabel = useCallback((labelOptions) => calendarCore.formatPeriodLabel(labelOptions), [calendarCore]);
	const formatCurrentPeriod = useCallback((labelOptions) => calendarCore.formatCurrentPeriod(labelOptions), [calendarCore]);
	const formatPeriod = useCallback((date, periodOptions) => calendarCore.formatPeriod(date, periodOptions), [calendarCore]);
	const getDateParts = useCallback((date, partsOptions) => calendarCore.getDateParts(date, partsOptions), [calendarCore]);
	const daysKey = `${state.currentPeriod}|${state.activeDate}|${state.viewMode.value}|${state.viewMode.unit}|${state.eventsVersion}`;
	const days = useMemo(() => {
		return calendarCore.getDaysWithEvents();
	}, [calendarCore, daysKey]);
	const getDaysInRange = useCallback((start, end) => calendarCore.getDaysInRange(start, end), [calendarCore]);
	const setResources = useCallback((resources) => calendarCore.setResources(resources), [calendarCore]);
	const setEvents = useCallback((events) => calendarCore.setEvents(events), [calendarCore]);
	return {
		...calendarCore.featureApi,
		activeDate: state.activeDate,
		currentPeriod: state.currentPeriod,
		viewMode: state.viewMode,
		days,
		getDaysInRange,
		getDaysNames,
		getTimeAxisLabels,
		getTimeSlots: getTimeAxisLabels,
		getEventsByDate,
		getAllDayEventsByDate,
		goToPreviousPeriod,
		goToNextPeriod,
		goToCurrentPeriod,
		goToSpecificPeriod,
		canGoPreviousPeriod,
		canGoNextPeriod,
		changeViewMode,
		addEvent,
		editEvent,
		removeEvent,
		isPending,
		groupDaysBy,
		resizeState,
		getResizeHandleProps,
		getDayColumnProps,
		moveState,
		startEventMove,
		updateEventMove,
		endEventMove,
		cancelEventMove,
		getEvents,
		validateMove,
		fetchEventsForRange,
		formatPeriodLabel,
		formatCurrentPeriod,
		formatPeriod,
		getDateParts,
		setResources,
		setEvents
	};
};

//#endregion
export { useCalendar };
//# sourceMappingURL=useCalendar.js.map