import { getDateTimeDefaults } from "../../utils/dateTimeDefaults.js";
import { normalizeLocale } from "../../date/helpers/normalizeLocale.js";
import { extractLocaleOptions } from "../extractLocaleOptions.js";

//#region src/formatter/buildTimeFormatter/buildTimeFormatter.ts
function buildTimeFormatter({ locale = getDateTimeDefaults().locale, options }) {
	const normalizedLocale = normalizeLocale(locale);
	const { formatOptions = {}, ...localeOptions } = extractLocaleOptions(typeof options === "string" ? { dateStyle: options } : options ?? {});
	const { timeStyle, ...rest } = formatOptions;
	const newOptions = {
		...localeOptions,
		...timeStyle ? { timeStyle } : rest
	};
	return new Intl.DateTimeFormat(normalizedLocale, newOptions);
}

//#endregion
export { buildTimeFormatter };
//# sourceMappingURL=buildTimeFormatter.js.map