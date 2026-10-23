const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');

//#region src/date/round/round.ts
function round(input, options) {
	return require_withDateOperation.withDateOperation((zdt, options) => {
		const { unit, roundingMode = "halfExpand", roundingIncrement } = options;
		return zdt.round({
			smallestUnit: unit,
			roundingMode,
			roundingIncrement
		});
	})(input, options);
}

//#endregion
exports.round = round;
//# sourceMappingURL=round.cjs.map