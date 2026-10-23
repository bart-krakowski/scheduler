//#region src/date/isValidDate/isValidDate.ts
function isValidDate(date) {
	if (Object.prototype.toString.call(date) !== "[object Date]") return false;
	const dateObj = date;
	return dateObj.getTime() === dateObj.getTime();
}

//#endregion
export { isValidDate };
//# sourceMappingURL=isValidDate.js.map