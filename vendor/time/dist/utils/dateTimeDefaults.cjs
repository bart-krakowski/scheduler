//#region src/utils/dateTimeDefaults.ts
const defaults = new Intl.DateTimeFormat().resolvedOptions();
function getDateTimeDefaults() {
	return defaults;
}

//#endregion
exports.getDateTimeDefaults = getDateTimeDefaults;
//# sourceMappingURL=dateTimeDefaults.cjs.map