import { withDateOperation } from "../withDateOperation/withDateOperation.js";

//#region src/date/set/set.ts
function set(input, options) {
	return withDateOperation((zdt, { fields }) => {
		return zdt.with(fields);
	})(input, options);
}

//#endregion
export { set };
//# sourceMappingURL=set.js.map