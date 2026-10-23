const require_dateTimeDefaults = require('../../utils/dateTimeDefaults.cjs');
const require_normalizeLocale = require('../../date/helpers/normalizeLocale.cjs');
const require_extractLocaleOptions = require('../extractLocaleOptions.cjs');

//#region src/formatter/buildDateTimeFormatter/buildDateTimeFormatter.ts
function buildDateTimeFormatter({ locale = require_dateTimeDefaults.getDateTimeDefaults().locale, options }) {
	const normalizedLocale = require_normalizeLocale.normalizeLocale(locale);
	const { formatOptions = {}, ...localeOptions } = require_extractLocaleOptions.extractLocaleOptions(typeof options === "string" ? {
		dateStyle: options,
		timeStyle: options
	} : options ?? {});
	const { dateStyle, timeStyle, ...rest } = formatOptions;
	const newOptions = {
		...localeOptions,
		...dateStyle && timeStyle ? {
			dateStyle,
			timeStyle
		} : rest
	};
	return new Intl.DateTimeFormat(normalizedLocale, newOptions);
}

//#endregion
exports.buildDateTimeFormatter = buildDateTimeFormatter;
//# sourceMappingURL=buildDateTimeFormatter.cjs.map