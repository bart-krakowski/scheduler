//#region src/validation/dependency/shift.ts
const MS_PER_MINUTE = 6e4;
function lagMs(link) {
	return (link?.lag ?? 0) * MS_PER_MINUTE;
}
function formatLagMinutes(lag) {
	return `${lag < 0 ? "-" : "+"}${Math.abs(lag)}m`;
}
function requiredShiftMs(type, predStartMs, predEndMs, succStartMs, succEndMs, lagMilliseconds = 0) {
	switch (type) {
		case "FS": return predEndMs + lagMilliseconds - succStartMs;
		case "SS": return predStartMs + lagMilliseconds - succStartMs;
		case "FF": return predEndMs + lagMilliseconds - succEndMs;
		case "SF": return predStartMs + lagMilliseconds - succEndMs;
	}
}

//#endregion
exports.formatLagMinutes = formatLagMinutes;
exports.lagMs = lagMs;
exports.requiredShiftMs = requiredShiftMs;
//# sourceMappingURL=shift.cjs.map