//#region src/useCalendar/inertResizeController.ts
const INERT_STATE = {
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
function inertResizeController() {
	return {
		subscribe: () => () => {},
		getSnapshot: () => INERT_STATE,
		setOptions: () => {},
		getOptions: () => ({}),
		registerDayColumn: () => {},
		getDayFromPoint: () => null,
		getDayFromElement: () => null,
		start: () => false,
		cancel: () => {},
		destroy: () => {},
		handleMouseMove: () => {},
		handleMouseUp: () => {}
	};
}

//#endregion
export { inertResizeController };
//# sourceMappingURL=inertResizeController.js.map