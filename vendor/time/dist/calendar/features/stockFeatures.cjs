const require_availability = require('./availability.cjs');
const require_booking = require('./booking.cjs');
const require_constraint = require('./constraint.cjs');
const require_dayLayout = require('./dayLayout.cjs');
const require_dependency = require('./dependency.cjs');
const require_duration = require('./duration.cjs');
const require_filter = require('./filter.cjs');
const require_history = require('./history.cjs');
const require_recurrence = require('./recurrence.cjs');
const require_move = require('./move.cjs');
const require_resize = require('./resize.cjs');
const require_timeline = require('./timeline.cjs');
const require_workingTime = require('./workingTime.cjs');

//#region src/calendar/features/stockFeatures.ts
const stockFeatures = [
	require_history.historyFeature,
	require_recurrence.eventRecurrenceFeature,
	require_dependency.eventDependencyFeature,
	require_constraint.schedulingConstraintFeature,
	require_duration.eventDurationFeature,
	require_filter.eventFilterFeature,
	require_workingTime.workingTimeFeature,
	require_availability.resourceAvailabilityFeature,
	require_booking.bookingFeature,
	require_resize.eventResizeFeature,
	require_move.eventMoveFeature,
	require_dayLayout.dayEventLayoutFeature,
	require_timeline.timelineFeature
];

//#endregion
exports.stockFeatures = stockFeatures;
//# sourceMappingURL=stockFeatures.cjs.map