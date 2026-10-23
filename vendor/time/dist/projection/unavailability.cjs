const require_minutes = require('../workingTime/minutes.cjs');

//#region src/projection/unavailability.ts
function toUnavailableRanges(ranges) {
	return ranges.map((range) => {
		const startFraction = range.startMinutes / require_minutes.MINUTES_IN_DAY;
		const endFraction = range.endMinutes / require_minutes.MINUTES_IN_DAY;
		const durationFraction = (range.endMinutes - range.startMinutes) / require_minutes.MINUTES_IN_DAY;
		return {
			startFraction,
			endFraction,
			top: `${startFraction * 100}%`,
			height: `${durationFraction * 100}%`,
			startTime: require_minutes.formatMinutesToTime(range.startMinutes),
			endTime: require_minutes.formatMinutesToTime(range.endMinutes)
		};
	});
}

//#endregion
exports.toUnavailableRanges = toUnavailableRanges;
//# sourceMappingURL=unavailability.cjs.map