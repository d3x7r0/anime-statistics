var fs = require("fs"),
    Bluebird = require("bluebird");

var CONFIG = require("../config")["writers"]["csv"];

Bluebird.promisifyAll(fs);

const TAG = "CVS";

const LINE_HEADERS = ["Name", "Type", "Year", "Month", "Genres", "Themes"];

function deleteFile(file) {
    return new Promise((resolve, reject) => {
        return fs.unlink(file, (err, res) => {
            return err ? reject(err) : resolve(res);
        });
    });
}

function writeHeader() {
    return fs.writeFile(CONFIG.out_file, `${LINE_HEADERS.join(CONFIG.separator)}\n`);
}

function printCSVLine(entry) {
    return [
        entry["name"] || "--",
        entry["type"] || "--",
        entry["year"] || "--",
        entry["month"] || "--",
        [].concat(entry["Genres"] || []).join(";"),
        [].concat(entry["Themes"] || []).join(";")
    ].join(CONFIG.separator);
}

var warned = false;

function prepare() {
    console.log(`[${TAG}] Preparing output file "${CONFIG.out_file}"`);

    warned = false;

    return deleteFile(CONFIG.out_file)
        .then(writeHeader, writeHeader);
}

function save(data) {
    console.log(`[${TAG}] Writing ${data.length} lines to file`);

    return fs.appendFile(
        CONFIG.out_file,
        data.map(printCSVLine).join(CONFIG.line_separator)
    );
}

function updateStats() {
    if (!warned) {
        warned = true;
        console.log(`[${TAG}] CVS writer doesn't support stats updates. All stats will be written at the end`);
    }
}

function finish(stats) {
    var keys = Object.keys(stats);

    var res = keys.join(CONFIG.separator);
    res += CONFIG.line_separator;
    res += keys
        .map((k) => stats[k])
        .join(CONFIG.separator);

    function write() {
        fs.appendFile(
            CONFIG.stats_file,
            res
        );
    }

    return deleteFile(CONFIG.stats_file).then(write, write);
}

module.exports = {
    prepare: prepare,
    save: save,
    finish: finish,
    updateStats: updateStats
};