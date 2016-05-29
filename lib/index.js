var Utils = require("./utils");

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

function processPage(writer, idx) {
    var continueProcess = false;

    idx = idx || 0;

    return Reader.getPage(idx)
        .then(data => {
            continueProcess = data.length >= Reader.PAGE_SIZE;
            return data;
        })
        .then(filterLines)
        .then(writer.save)
        .then(() => writer.updateStats(STATS))
        .then(Utils.delay())
        .then(() => continueProcess && processPage(writer, idx + 1));
}

function collectStats() {
    STATS.finish = +new Date();
    STATS.duration = STATS.finish - STATS.start;

    return STATS;
}

// Run
module.exports = {
    run: function run(writerName) {
        var writer = require(`./writers/${writerName}`);

        return writer.prepare()
            .then(() => processPage(writer))
            .then(collectStats)
            .then(writer.finish)
            .then(
                () => {
                    console.log(`[${TAG}] Finished`);
                    console.log(`[${TAG}] Stats:\n${ JSON.stringify(STATS, null, 2)}`);
                },
                console.error.bind(console)
            );
    }
};
