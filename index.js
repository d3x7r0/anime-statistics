var Utils = require('./utils');

var Writer = require("./writers/csv");
// var Writer = require("./writers/couch");

var Reader = require("./readers/ann");

const TAG = "CORE";

var STATS = {
    start: +new Date(),
    processed: 0,
    discarded: 0,
    stored: 0
};

function filterLine(entry) {
    return entry["year"] && (entry["Genres"].length > 0 || entry["Themes"] > 0);
}

function filterLines(data) {
    var count = data.length;

    STATS.processed += count;

    data = data.filter(filterLine);

    count = count - data.length;

    STATS.discarded += count;
    STATS.stored += data.length;

    if (count > 0) {
        console.log(`[${TAG}] Discarded ${count} lines`);
    }

    return data;
}

function processPage(idx) {
    var continueProcess = false;

    idx = idx || 0;

    return Reader.getPage(idx)
        .then(data => {
            continueProcess = data.length == Reader.PAGE_SIZE;
            return data;
        })
        .then(filterLines)
        .then(Writer.save)
        .then(Utils.delay())
        .then(() => continueProcess && processPage(idx + 1));
}

function collectStats() {
    STATS.finish = +new Date();
    STATS.duration = STATS.finish - STATS.start;

    return STATS;
}

// Run
Writer.prepare()
    .then(() => processPage())
    .then(collectStats)
    .then(Writer.finish)
    .then(
        () => {
            console.log(`[${TAG}] Finished`);
            console.log(`[${TAG}] Stats:\n${ JSON.stringify(STATS, null, 2)}`);
        },
        console.error.bind(console)
    );