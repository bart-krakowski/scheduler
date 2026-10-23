const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');

//#region src/date/ceil/ceil.ts
function ceil(input, options) {
	return require_withDateOperation.withDateOperation((zdt, { unit }) => {
		return zdt.round({
			smallestUnit: unit,
			roundingMode: "ceil"
		});
	})(input, options);
}

//#endregion
exports.ceil = ceil;
//# sourceMappingURL=ceil.cjs.map