import { withDateOperation } from "../withDateOperation/withDateOperation.js";

//#region src/date/subtract/subtract.ts
function subtract(input, options) {
	return withDateOperation((zdt, { duration }) => {
		return zdt.subtract(duration);
	})(input, options);
}

//#endregion
export { subtract };
//# sourceMappingURL=subtract.js.map