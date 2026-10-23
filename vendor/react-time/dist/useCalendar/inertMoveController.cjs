//#region src/useCalendar/inertMoveController.ts
const INERT_STATE = {
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
function inertMoveController() {
	return {
		subscribe: () => () => {},
		getSnapshot: () => INERT_STATE,
		setOptions: () => {},
		getOptions: () => ({}),
		start: () => false,
		moveTo: () => {},
		end: () => {},
		cancel: () => {},
		destroy: () => {}
	};
}

//#endregion
exports.inertMoveController = inertMoveController;
//# sourceMappingURL=inertMoveController.cjs.map