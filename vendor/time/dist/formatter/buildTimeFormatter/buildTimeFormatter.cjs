const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_normalizeLocale = require('../../date/helpers/normalizeLocale.cjs');
const require_extractLocaleOptions = require('../extractLocaleOptions.cjs');

//#region src/formatter/buildTimeFormatter/buildTimeFormatter.ts
function buildTimeFormatter({ locale = require_dateTimeDefaults.getDateTimeDefaults().locale, options }) {
	const normalizedLocale = require_normalizeLocale.normalizeLocale(locale);
	const { formatOptions = {}, ...localeOptions } = require_extractLocaleOptions.extractLocaleOptions(typeof options === "string" ? { dateStyle: options } : options ?? {});
	const { timeStyle, ...rest } = formatOptions;
	const newOptions = {
		...localeOptions,
		...timeStyle ? { timeStyle } : rest
	};
	return new Intl.DateTimeFormat(normalizedLocale, newOptions);
}

//#endregion
exports.buildTimeFormatter = buildTimeFormatter;
//# sourceMappingURL=buildTimeFormatter.cjs.map