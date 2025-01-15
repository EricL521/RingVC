// class for watching maps
class WatcherMap extends Map {
	// onset and onget are functions
	constructor(onModify, onGet, ...args) {
		super(...args);

		this.onModify = (onModify === null || typeof onModify === "undefined")? () => {}: onModify;
		this.onGet = (onGet === null || typeof onGet === "undefined")? () => {}: onGet;
	}

	set(...args) {
		const returnVal = super.set(...args);
		this.onModify();
		return returnVal;
	}

	delete(...args) {
		const returnVal = super.delete(...args);
		this.onModify();
		return returnVal;
	}

	get(...args) {
		const returnVal = super.get(...args);
		this.onGet();
		return returnVal;
	}
}

module.exports = {
	WatcherMap
}