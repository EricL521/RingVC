// stores and updates data
const fs = require("fs");
const {saveInterval} = require("../config.json");

// whether or not the data has been modified
// if it hasn't, won't write to data.json
let modified = false;

let data = require("./data.json");
// proxy detects changes to data
const dataProxy = new Proxy(data, {
    set: (object, property, value) => {
        object[property] = value;
        
        modified = true;

        return true;
    }
});

setInterval(() => {
    if (modified)
        fs.writeFile("./main/data.json", JSON.stringify(data, null, 4), (err) => {
            if (err) throw err;
            console.log("data saved");
        });
    modified = false;
}, saveInterval * 1000); // save interval is in seconds

module.exports = {
    data: dataProxy
};