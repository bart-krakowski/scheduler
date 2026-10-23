const require_inertMoveController = require('./inertMoveController.cjs');
const require_inertResizeController = require('./inertResizeController.cjs');
let react = require("react");
let _tanstack_react_store = require("@tanstack/react-store");
let _tanstack_time = require("@tanstack/time");

//#region src/useCalendar/useCalendar.ts
const useCalendar = (options) => {
	const { resize, move, ...calendarOptions } = options;
	const [calendarCore] = (0, react.useState)(() => (0, _tanstack_time.createCalendar)(calendarOptions));
	const state = (0, _tanstack_react_store.useStore)(calendarCore.store);
	const isPending = state.isPending;
	(0, react.useEffect)(() => {
		calendarCore.ensureRangeLoaded();
	}, [
		calendarCore,
		state.currentPeriod,
		state.viewMode,
		state.activeDate
	]);
	const [resizeController] = (0, react.useState)(() => calendarCore.hasFeature("resize") ? calendarCore.createResizeController(resize) : require_inertResizeController.inertResizeController());
	(0, react.useEffect)(() => {
		resizeController.setOptions(resize ?? {});
	}, [resizeController, resize]);
	(0, react.useEffect)(() => {
		return () => {
			resizeController.destroy();
		};
	}, [resizeController]);
	const resizeState = (0, react.useSyncExternalStore)(resizeController.subscribe, resizeController.getSnapshot, resizeController.getSnapshot);
	const [moveController] = (0, react.useState)(() => calendarCore.hasFeature("move") ? calendarCore.createMoveController(move) : require_inertMoveController.inertMoveController());
	(0, react.useEffect)(() => {
		moveController.setOptions(move ?? {});
	}, [moveController, move]);
	(0, react.useEffect)(() => {
		return () => {
			moveController.destroy();
		};
	}, [moveController]);
	const moveState = (0, react.useSyncExternalStore)(moveController.subscribe, moveController.getSnapshot, moveController.getSnapshot);
	const startEventMove = (0, react.useCallback)((args) => moveController.start(args), [moveController]);
	const updateEventMove = (0, react.useCallback)((args) => {
		moveController.moveTo(args);
	}, [moveController]);
	const endEventMove = (0, react.useCallback)(() => {
		moveController.end();
	}, [moveController]);
	const cancelEventMove = (0, react.useCallback)(() => {
		moveController.cancel();
	}, [moveController]);
	const resizeHandlePropsCacheRef = (0, react.useRef)(/* @__PURE__ */ new Map());
	const dayColumnPropsCacheRef = (0, react.useRef)(/* @__PURE__ */ new Map());
	const getResizeHandleProps = (0, react.useCallback)((eventId, edge, originalStart, originalEnd, handleOptions) => {
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
	const getDayColumnProps = (0, react.useCallback)((dayDate) => {
		const cache = dayColumnPropsCacheRef.current;
		const cached = cache.get(dayDate);
		if (cached) return cached;
		const props = { ref: (element) => {
			resizeController.registerDayColumn(dayDate, element);
		} };
		cache.set(dayDate, props);
		return props;
	}, [resizeController]);
	const goToPreviousPeriod = (0, react.useCallback)(() => {
		calendarCore.goToPreviousPeriod();
	}, [calendarCore]);
	const goToNextPeriod = (0, react.useCallback)(() => {
		calendarCore.goToNextPeriod();
	}, [calendarCore]);
	const goToCurrentPeriod = (0, react.useCallback)(() => {
		calendarCore.goToCurrentPeriod();
	}, [calendarCore]);
	const goToSpecificPeriod = (0, react.useCallback)((date) => {
		calendarCore.goToSpecificPeriod(date);
	}, [calendarCore]);
	const changeViewMode = (0, react.useCallback)((newViewMode) => {
		calendarCore.changeViewMode(newViewMode);
	}, [calendarCore]);
	const groupDaysBy = (0, react.useCallback)((props) => calendarCore.groupDaysBy(props), [calendarCore]);
	const getDaysNames = (0, react.useCallback)((props) => calendarCore.getDaysNames(props), [calendarCore]);
	const getTimeAxisLabels = (0, react.useCallback)((labelOptions) => calendarCore.getTimeAxisLabels(labelOptions), [calendarCore]);
	const getEventsByDate = (0, react.useCallback)((date) => calendarCore.getEventsByDate(date), [calendarCore]);
	const getAllDayEventsByDate = (0, react.useCallback)((date) => calendarCore.getAllDayEventsByDate(date), [calendarCore]);
	const canGoPreviousPeriod = (0, react.useCallback)(() => calendarCore.canGoPreviousPeriod(), [calendarCore]);
	const canGoNextPeriod = (0, react.useCallback)(() => calendarCore.canGoNextPeriod(), [calendarCore]);
	const addEvent = (0, react.useCallback)((event, addOptions) => calendarCore.addEvent(event, addOptions), [calendarCore]);
	const editEvent = (0, react.useCallback)((eventId, updates, editOptions) => calendarCore.editEvent(eventId, updates, editOptions), [calendarCore]);
	const removeEvent = (0, react.useCallback)((id) => calendarCore.removeEvent(id), [calendarCore]);
	const getEvents = (0, react.useCallback)(() => calendarCore.getEvents(), [calendarCore]);
	const validateMove = (0, react.useCallback)((eventId, newStart, newEnd, newResources) => calendarCore.validateMove(eventId, newStart, newEnd, newResources), [calendarCore]);
	const fetchEventsForRange = (0, react.useCallback)((start, end) => calendarCore.fetchEventsForRange(start, end), [calendarCore]);
	const formatPeriodLabel = (0, react.useCallback)((labelOptions) => calendarCore.formatPeriodLabel(labelOptions), [calendarCore]);
	const formatCurrentPeriod = (0, react.useCallback)((labelOptions) => calendarCore.formatCurrentPeriod(labelOptions), [calendarCore]);
	const formatPeriod = (0, react.useCallback)((date, periodOptions) => calendarCore.formatPeriod(date, periodOptions), [calendarCore]);
	const getDateParts = (0, react.useCallback)((date, partsOptions) => calendarCore.getDateParts(date, partsOptions), [calendarCore]);
	const daysKey = `${state.currentPeriod}|${state.activeDate}|${state.viewMode.value}|${state.viewMode.unit}|${state.eventsVersion}`;
	const days = (0, react.useMemo)(() => {
		return calendarCore.getDaysWithEvents();
	}, [calendarCore, daysKey]);
	const getDaysInRange = (0, react.useCallback)((start, end) => calendarCore.getDaysInRange(start, end), [calendarCore]);
	const setResources = (0, react.useCallback)((resources) => calendarCore.setResources(resources), [calendarCore]);
	const setEvents = (0, react.useCallback)((events) => calendarCore.setEvents(events), [calendarCore]);
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
exports.useCalendar = useCalendar;
//# sourceMappingURL=useCalendar.cjs.map