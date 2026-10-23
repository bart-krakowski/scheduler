const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');

//#region src/date/set/set.ts
function set(input, options) {
	return require_withDateOperation.withDateOperation((zdt, { fields }) => {
		return zdt.with(fields);
	})(input, options);
}

//#endregion
exports.set = set;
//# sourceMappingURL=set.cjs.map