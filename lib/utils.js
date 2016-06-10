var Bluebird = require("bluebird");

var CONFIG = require("./config");

const TAG = "UTILS";

function delay(time) {
    time = time === undefined ? CONFIG.delay : time;

    return function doDelay(data) {
        console.log(`[${TAG}] Delaying ${time} milliseconds between requests`);
        return Bluebird.delay(time, data);
    };
}

var QUEUE = Bluebird.resolve();

function queue(fn, data) {
    var delayer = delay();

    var ret = QUEUE.then(() => fn(data));

    QUEUE = ret.then(delayer, delayer);

    return ret;
}

module.exports = {
    DEFAULT_DELAY: CONFIG.delay,
    delay: delay,
    queue: queue
};