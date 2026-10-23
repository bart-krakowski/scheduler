import { withDateOperation } from "../withDateOperation/withDateOperation.js";

//#region src/date/add/add.ts
function add(input, options) {
	return withDateOperation((zdt, { duration }) => {
		return zdt.add(duration);
	})(input, options);
}

//#endregion
export { add };
//# sourceMappingURL=add.js.map