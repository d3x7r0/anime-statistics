var Bluebird = require("bluebird");

const TAG = "UTILS";

const DEFAULT = 1000;

function delay(time) {
    time = time === undefined ? DEFAULT : time;

    return function doDelay(data) {
        console.log(`[${TAG}] Delaying ${time} milliseconds between requests`);
        return Bluebird.delay(time, data);
    };
}

module.exports = {
    delay: delay,
    DEFAULT: DEFAULT
};