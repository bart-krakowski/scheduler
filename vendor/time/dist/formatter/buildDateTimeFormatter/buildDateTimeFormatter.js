import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { normalizeLocale } from "../../date/helpers/normalizeLocale.js";
import { extractLocaleOptions } from "../extractLocaleOptions.js";

//#region src/formatter/buildDateTimeFormatter/buildDateTimeFormatter.ts
function buildDateTimeFormatter({ locale = getDateTimeDefaults().locale, options }) {
	const normalizedLocale = normalizeLocale(locale);
	const { formatOptions = {}, ...localeOptions } = extractLocaleOptions(typeof options === "string" ? {
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
export { buildDateTimeFormatter };
//# sourceMappingURL=buildDateTimeFormatter.js.map