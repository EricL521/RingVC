// stores and updates data
const fs = require("fs");
const {saveInterval} = require("../config.json");

let data = require("./data.json");
data.push("test");

setInterval(() => {
    fs.writeFile("./main/data.json", JSON.stringify(data, null, 4), (err) => {
        if (err) throw err;
        console.log("data saved");
    });
}, saveInterval * 1000); // save interval is in seconds

module.exports = {
    data: data
};