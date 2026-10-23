const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_normalizeLocale = require('../../date/helpers/normalizeLocale.cjs');
const require_extractLocaleOptions = require('../extractLocaleOptions.cjs');

//#region src/formatter/buildDateFormatter/buildDateFormatter.ts
function buildDateFormatter({ locale = require_dateTimeDefaults.getDateTimeDefaults().locale, options }) {
	const normalizedLocale = require_normalizeLocale.normalizeLocale(locale);
	const { formatOptions = {}, ...localeOptions } = require_extractLocaleOptions.extractLocaleOptions(typeof options === "string" ? { dateStyle: options } : options ?? {});
	const { dateStyle, ...rest } = formatOptions;
	const newOptions = {
		...localeOptions,
		...dateStyle ? { dateStyle } : rest
	};
	return new Intl.DateTimeFormat(normalizedLocale, newOptions);
}

//#endregion
exports.buildDateFormatter = buildDateFormatter;
//# sourceMappingURL=buildDateFormatter.cjs.map