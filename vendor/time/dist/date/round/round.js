import { withDateOperation } from "../withDateOperation/withDateOperation.js";

//#region src/date/round/round.ts
function round(input, options) {
	return withDateOperation((zdt, options) => {
		const { unit, roundingMode = "halfExpand", roundingIncrement } = options;
		return zdt.round({
			smallestUnit: unit,
			roundingMode,
			roundingIncrement
		});
	})(input, options);
}

//#endregion
export { round };
//# sourceMappingURL=round.js.map