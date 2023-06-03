// class for watching maps
class WatcherMap extends Map {
    // onset and onget are functions
    constructor(onModify, onGet, ...args) {
        super(...args);

        this.onModify = (onModify === null || typeof onModify === "undefined")? () => {}: onModify;
        this.onGet = (onGet === null || typeof onGet === "undefined")? () => {}: onGet;
    }

    set(...args) {
        this.onModify();
        return super.set(...args);
    }

    delete(...args) {
        this.onModify();
        return super.delete(...args);
    }

    get(...args) {
        this.onGet();
        return super.get(...args);
    }
}

module.exports = {
    WatcherMap
}