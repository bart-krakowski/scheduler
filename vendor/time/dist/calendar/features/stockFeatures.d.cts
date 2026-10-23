import { workingTimeFeature } from "./workingTime.cjs";
import { resourceAvailabilityFeature } from "./availability.cjs";
import { bookingFeature } from "./booking.cjs";
import { schedulingConstraintFeature } from "./constraint.cjs";
import { dayEventLayoutFeature } from "./dayLayout.cjs";
import { eventDependencyFeature } from "./dependency.cjs";
import { eventDurationFeature } from "./duration.cjs";
import { eventFilterFeature } from "./filter.cjs";
import { historyFeature } from "./history.cjs";
import { eventRecurrenceFeature } from "./recurrence.cjs";
import { eventMoveFeature } from "./move.cjs";
import { eventResizeFeature } from "./resize.cjs";
import { timelineFeature } from "./timeline.cjs";
//#region src/calendar/features/stockFeatures.d.ts
declare const stockFeatures: readonly [typeof historyFeature, typeof eventRecurrenceFeature, typeof eventDependencyFeature, typeof schedulingConstraintFeature, typeof eventDurationFeature, typeof eventFilterFeature, typeof workingTimeFeature, typeof resourceAvailabilityFeature, typeof bookingFeature, typeof eventResizeFeature, typeof eventMoveFeature, typeof dayEventLayoutFeature, typeof timelineFeature];
type StockFeatures = typeof stockFeatures;
//#endregion
export { StockFeatures, stockFeatures };
//# sourceMappingURL=stockFeatures.d.cts.map