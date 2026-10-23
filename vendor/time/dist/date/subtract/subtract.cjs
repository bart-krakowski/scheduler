const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');

//#region src/date/subtract/subtract.ts
function subtract(input, options) {
	return require_withDateOperation.withDateOperation((zdt, { duration }) => {
		return zdt.subtract(duration);
	})(input, options);
}

//#endregion
exports.subtract = subtract;
//# sourceMappingURL=subtract.cjs.map