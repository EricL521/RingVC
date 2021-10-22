// class for watching maps
class WatcherMap extends Map {
    // onset and onget are functions
    constructor(onSet, onGet, ...args) {
        super(...args);

        this.onSet = (onSet === null || typeof onSet === "undefined")? () => {}: onSet;
        this.onGet = (onGet === null || typeof onGet === "undefined")? () => {}: onGet;
    }

    set(...args) {
        this.onSet();
        return super.set(...args);
    }

    get(...args) {
        this.onGet();
        return super.get(...args);
    }
}

module.exports = {
    WatcherMap
}