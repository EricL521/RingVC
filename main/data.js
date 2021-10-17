// stores and updates data
const fs = require("fs");
const {saveInterval} = require("../config.json");

// import watchermap
const {WatcherMap} = require("./classes/storage/watcher-map.js");

// whether or not the data has been modified
// if it hasn't, won't write to data.json
let modified = false;
const onModify = () => {
    modified = true;
}

let data = new WatcherMap(onModify, null);

module.exports = {
    data: data,
    onModify: onModify
};

// // stolen from https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
// const replacer = (key, value) => {
//     if(value instanceof Map) {
//         return {
//             dataType: 'Map',
//             value: Array.from(value.entries()), // or with spread: value: [...value]
//         };
//     } else {
//         return value;
//     }
// };
// const reviver = (key, value) => {
//     if(typeof value === 'object' && value !== null) {
//         if (value.dataType === 'Map') {
//             return value.value.reduce((map, object) => {
//                 map.set(object[0], object[1]);
//             }, new WatcherMap(onModify, null));
//         }
//     }
//     return value;
// };

// let data = JSON.parse(JSON.stringify(require("./data.json")), reviver);
// modified = false;

// setInterval(() => {
//     if (modified) {
//         fs.writeFile("./main/data.json", JSON.stringify(data, replacer, 4), (err) => {
//             if (err) throw err;
//             console.log("data saved");
//         });
//         console.log(data);
//     }
//     modified = false;
// }, saveInterval * 1000); // save interval is in seconds