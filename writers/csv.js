var fs = require("fs"),
    Bluebird = require("bluebird");

Bluebird.promisifyAll(fs);

const TAG = "CVS";

const OUT_FILE = "out.csv";
const HEADERS = ["Name", "Type", "Year", "Month", "Genres", "Themes"];
const SEPARATOR = ", ";

function deleteOutFile() {
    return new Promise((resolve, reject) => {
        return fs.unlink(OUT_FILE, (err, res) => {
            return err ? reject(err) : resolve(res);
        });
    });
}

function writeHeader() {
    return fs.writeFile(OUT_FILE, `${HEADERS.join(SEPARATOR)}\n`);
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

    return deleteOutFile()
        .then(writeHeader, writeHeader);
}

function save(data) {
    console.log(`[${TAG}] Writing ${data.length} lines to file`);

    return fs.appendFile(
        OUT_FILE,
        data.map(printCSVLine).join("\n")
    );
}

module.exports = {
    prepare: prepare,
    save: save
};