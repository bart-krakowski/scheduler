import { resourceAvailabilityFeature } from "./availability.js";
import { bookingFeature } from "./booking.js";
import { schedulingConstraintFeature } from "./constraint.js";
import { dayEventLayoutFeature } from "./dayLayout.js";
import { eventDependencyFeature } from "./dependency.js";
import { eventDurationFeature } from "./duration.js";
import { eventFilterFeature } from "./filter.js";
import { historyFeature } from "./history.js";
import { eventRecurrenceFeature } from "./recurrence.js";
import { eventMoveFeature } from "./move.js";
import { eventResizeFeature } from "./resize.js";
import { timelineFeature } from "./timeline.js";
import { workingTimeFeature } from "./workingTime.js";

//#region src/calendar/features/stockFeatures.ts
const stockFeatures = [
	historyFeature,
	eventRecurrenceFeature,
	eventDependencyFeature,
	schedulingConstraintFeature,
	eventDurationFeature,
	eventFilterFeature,
	workingTimeFeature,
	resourceAvailabilityFeature,
	bookingFeature,
	eventResizeFeature,
	eventMoveFeature,
	dayEventLayoutFeature,
	timelineFeature
];

//#endregion
export { stockFeatures };
//# sourceMappingURL=stockFeatures.js.map