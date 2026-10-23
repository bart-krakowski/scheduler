import { parse } from "./parse/parse.js";
import { isValidDate } from "./isValidDate/isValidDate.js";

//#region src/date/validateDate.ts
function validateDate({ date, parse: parse$1 = parse, errorMessage = `Invalid Date: "${date}"` }) {
	const d = parse$1(date);
	if (!isValidDate(d)) throw new Error(`${errorMessage}: "${date}"`);
	return d;
}

//#endregion
export { validateDate };
//# sourceMappingURL=validateDate.js.map