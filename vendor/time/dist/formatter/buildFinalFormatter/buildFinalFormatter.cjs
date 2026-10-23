const require_parse = require('../../date/parse/parse.cjs');
const require_validateDate = require('../../date/validateDate.cjs');

//#region src/formatter/buildFinalFormatter/buildFinalFormatter.ts
function buildFinalFormatter({ formatter, formatterName, parse: parse$1 = require_parse.parse, forRange = false }) {
	return (date, date2) => {
		if (!date) return "";
		const trueDate = require_validateDate.validateDate({
			date,
			parse: parse$1,
			errorMessage: `[${formatterName}] date "${date}" is Invalid.`
		});
		if (!forRange || !date2) return formatter.format(trueDate);
		const endDate = require_validateDate.validateDate({
			date: date2,
			parse: parse$1,
			errorMessage: `[${formatterName}] second date "${date2}" is Invalid.`
		});
		return formatter.formatRange(trueDate, endDate);
	};
}

//#endregion
exports.buildFinalFormatter = buildFinalFormatter;
//# sourceMappingURL=buildFinalFormatter.cjs.map