var Bluebird = require("bluebird");

var CONFIG = require("./config");

const TAG = "UTILS";

function delay(time) {
    time = time === undefined ? CONFIG.delay: time;

    return function doDelay(data) {
        console.log(`[${TAG}] Delaying ${time} milliseconds between requests`);
        return Bluebird.delay(time, data);
    };
}

module.exports = {
    delay: delay
};