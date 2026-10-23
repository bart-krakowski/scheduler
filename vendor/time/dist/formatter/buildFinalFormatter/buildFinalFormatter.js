import { parse } from "../../date/parse/parse.js";
import { validateDate } from "../../date/validateDate.js";

//#region src/formatter/buildFinalFormatter/buildFinalFormatter.ts
function buildFinalFormatter({ formatter, formatterName, parse: parse$1 = parse, forRange = false }) {
	return (date, date2) => {
		if (!date) return "";
		const trueDate = validateDate({
			date,
			parse: parse$1,
			errorMessage: `[${formatterName}] date "${date}" is Invalid.`
		});
		if (!forRange || !date2) return formatter.format(trueDate);
		const endDate = validateDate({
			date: date2,
			parse: parse$1,
			errorMessage: `[${formatterName}] second date "${date2}" is Invalid.`
		});
		return formatter.formatRange(trueDate, endDate);
	};
}

//#endregion
export { buildFinalFormatter };
//# sourceMappingURL=buildFinalFormatter.js.map