import { MINUTES_IN_DAY, formatMinutesToTime } from "../workingTime/minutes.js";

//#region src/projection/unavailability.ts
function toUnavailableRanges(ranges) {
	return ranges.map((range) => {
		const startFraction = range.startMinutes / MINUTES_IN_DAY;
		const endFraction = range.endMinutes / MINUTES_IN_DAY;
		const durationFraction = (range.endMinutes - range.startMinutes) / MINUTES_IN_DAY;
		return {
			startFraction,
			endFraction,
			top: `${startFraction * 100}%`,
			height: `${durationFraction * 100}%`,
			startTime: formatMinutesToTime(range.startMinutes),
			endTime: formatMinutesToTime(range.endMinutes)
		};
	});
}

//#endregion
export { toUnavailableRanges };
//# sourceMappingURL=unavailability.js.map