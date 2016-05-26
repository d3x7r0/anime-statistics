var fs = require("fs"),
    Bluebird = require("bluebird");

Bluebird.promisifyAll(fs);

const TAG = "CVS";

const OUT_FILE = "out.csv";
const STATS_FILE = "stats.csv";
const LINE_HEADERS = ["Name", "Type", "Year", "Month", "Genres", "Themes"];
const SEPARATOR = ", ";
const LINE_SEPARATOR = "\n";

function deleteFile(file) {
    return new Promise((resolve, reject) => {
        return fs.unlink(file, (err, res) => {
            return err ? reject(err) : resolve(res);
        });
    });
}

function writeHeader() {
    return fs.writeFile(OUT_FILE, `${LINE_HEADERS.join(SEPARATOR)}\n`);
}

function printCSVLine(entry) {
    return [
        entry["name"] || "--",
        entry["type"] || "--",
        entry["year"] || "--",
        entry["month"] || "--",
        [].concat(entry["Genres"] || []).join(";"),
        [].concat(entry["Themes"] || []).join(";")
    ].join(SEPARATOR);
}

function prepare() {
    console.log(`[${TAG}] Preparing output file "${OUT_FILE}"`);

    return deleteFile(OUT_FILE)
        .then(writeHeader, writeHeader);
}

function save(data) {
    console.log(`[${TAG}] Writing ${data.length} lines to file`);

    return fs.appendFile(
        OUT_FILE,
        data.map(printCSVLine).join(LINE_SEPARATOR)
    );
}

function finish(stats) {
    var keys = Object.keys(stats);

    var res = keys.join(SEPARATOR);
    res += LINE_SEPARATOR;
    res += keys
        .map((k) => stats[k])
        .join(SEPARATOR);

    function write() {
        fs.appendFile(
            STATS_FILE,
            res
        );
    }

    return deleteFile(STATS_FILE).then(write, write);
}

module.exports = {
    prepare: prepare,
    save: save,
    finish: finish
};