import { formatMinutesToTime } from "../../workingTime/minutes.js";

//#region src/validation/availability/conflicts.ts
function describeUnavailability(details) {
	return details.map((detail) => `${detail.resourceLabel} (${detail.reason})`).join(", ");
}
function toUnavailabilityConflict(input) {
	const { date, startMinutes, endMinutes, details } = input;
	return {
		date,
		conflictRange: {
			start: formatMinutesToTime(startMinutes),
			end: formatMinutesToTime(endMinutes)
		},
		resourceIds: details.map((detail) => detail.resourceId),
		resourceDetails: details.map((detail) => ({
			resourceId: detail.resourceId,
			resourceLabel: detail.resourceLabel,
			reason: detail.reason,
			description: detail.description
		})),
		description: details.map((detail) => detail.description).join("; ")
	};
}

//#endregion
export { describeUnavailability, toUnavailabilityConflict };
//# sourceMappingURL=conflicts.js.map