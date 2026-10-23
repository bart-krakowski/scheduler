//#region src/date/helpers/normalizeLocale.ts
function normalizeLocale(locale) {
	return Array.isArray(locale) ? locale.map((loc) => typeof loc === "string" ? loc : loc.toString()) : typeof locale === "string" ? locale : locale.toString();
}

//#endregion
exports.normalizeLocale = normalizeLocale;
//# sourceMappingURL=normalizeLocale.cjs.map