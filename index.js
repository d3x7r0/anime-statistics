var Utils = require('./utils'),
    Writer = require("./writers/csv"),
    Reader = require("./readers/ann");

const TAG = "CORE";

function filterLine(entry) {
    return entry["year"] && (entry["Genres"].length > 0 || entry["Themes"] > 0);
}

function filterLines(data) {
    var count = data.length;

    data = data.filter(filterLine);

    count = count - data.length;

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

// Run
Writer.prepare()
    .then(() => processPage())
    .then(() => console.log("Done"), console.error.bind(console));