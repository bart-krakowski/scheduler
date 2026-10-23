const require_withDateOperation = require('../withDateOperation/withDateOperation.cjs');

//#region src/date/add/add.ts
function add(input, options) {
	return require_withDateOperation.withDateOperation((zdt, { duration }) => {
		return zdt.add(duration);
	})(input, options);
}

//#endregion
exports.add = add;
//# sourceMappingURL=add.cjs.map