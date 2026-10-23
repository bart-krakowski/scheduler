import { workingTimeFeature } from "./workingTime.js";
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
//#region src/calendar/features/stockFeatures.d.ts
declare const stockFeatures: readonly [typeof historyFeature, typeof eventRecurrenceFeature, typeof eventDependencyFeature, typeof schedulingConstraintFeature, typeof eventDurationFeature, typeof eventFilterFeature, typeof workingTimeFeature, typeof resourceAvailabilityFeature, typeof bookingFeature, typeof eventResizeFeature, typeof eventMoveFeature, typeof dayEventLayoutFeature, typeof timelineFeature];
type StockFeatures = typeof stockFeatures;
//#endregion
export { StockFeatures, stockFeatures };
//# sourceMappingURL=stockFeatures.d.ts.map