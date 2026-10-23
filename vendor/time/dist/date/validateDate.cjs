const require_parse = require('./parse/parse.cjs');
const require_isValidDate = require('./isValidDate/isValidDate.cjs');

//#region src/date/validateDate.ts
function validateDate({ date, parse: parse$1 = require_parse.parse, errorMessage = `Invalid Date: "${date}"` }) {
	const d = parse$1(date);
	if (!require_isValidDate.isValidDate(d)) throw new Error(`${errorMessage}: "${date}"`);
	return d;
}

//#endregion
exports.validateDate = validateDate;
//# sourceMappingURL=validateDate.cjs.map