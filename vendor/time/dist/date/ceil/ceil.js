import { withDateOperation } from "../withDateOperation/withDateOperation.js";

//#region src/date/ceil/ceil.ts
function ceil(input, options) {
	return withDateOperation((zdt, { unit }) => {
		return zdt.round({
			smallestUnit: unit,
			roundingMode: "ceil"
		});
	})(input, options);
}

//#endregion
export { ceil };
//# sourceMappingURL=ceil.js.map