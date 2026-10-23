const require_minutes = require('../../workingTime/minutes.cjs');

//#region src/validation/availability/conflicts.ts
function describeUnavailability(details) {
	return details.map((detail) => `${detail.resourceLabel} (${detail.reason})`).join(", ");
}
function toUnavailabilityConflict(input) {
	const { date, startMinutes, endMinutes, details } = input;
	return {
		date,
		conflictRange: {
			start: require_minutes.formatMinutesToTime(startMinutes),
			end: require_minutes.formatMinutesToTime(endMinutes)
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
exports.describeUnavailability = describeUnavailability;
exports.toUnavailabilityConflict = toUnavailabilityConflict;
//# sourceMappingURL=conflicts.cjs.map