// http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist=50&nskip=0&type=anime
// http://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=1&title=2... max: 50

var fetch = require("node-fetch"),
    fs = require("fs"),
    xml2js = require("xml2js"),
    Bluebird = require("bluebird");

Bluebird.promisifyAll(fs);

const LIST_URL = "http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist={limit}&nskip={offset}&type=anime";
const SINGLE_URL = "http://cdn.animenewsnetwork.com/encyclopedia/api.xml?";
const OUT_FILE = "out.csv";
const PAGE_SIZE = 50;
const HEADERS = ["Name", "Type", "Year", "Month", "Genres", "Themes"];
const SEPARATOR = ", ";

const parseXMLString = Bluebird.promisify(xml2js.parseString);

function getPage(i) {
    console.log(`Fetching page ${i}`);

    return fetchXML(LIST_URL.replace("{limit}", "" + PAGE_SIZE).replace("{offset}", "" + (i * PAGE_SIZE)))
        .then(data => data["report"]["item"]
            .map(i => `title=${i["id"]}`)
            .join("&")
        )
        .then(delay(1000))
        .then(ids => fetchXML(SINGLE_URL + ids))
        .then(data => data["ann"]["anime"].map(cleanupEntry));
}

function fetchXML(url) {
    console.log(`Fetching ${url}`);

    return fetch(url)
        .then(res => res.text())
        .then(raw => parseXMLString(raw));
}

const DATE_REGEX = /(\d{4})-?(\d{2})?-?(\d{2})?/;

function cleanupEntry(data) {
    var res, info, date;

    res = data["$"];

    info = [].concat(data["info"] || []);

    res["Vintage"] = getXMLValue(info, "Vintage").pop();

    if (res["Vintage"]) {
        date = DATE_REGEX.exec(res["Vintage"]);

        if (date) {
            res["year"] = date[1];
            res["month"] = date[2];
        }
    }

    res["Genres"] = getXMLValue(info, "Genres");
    res["Themes"] = getXMLValue(info, "Themes");

    return res;
}

function getXMLValue(data, value) {
    return data
        .filter(i => i["$"]["type"] === value)
        .map(d => d["_"])
        .filter(v => !!v);
}

function delay(time) {
    return function doDelay(data) {
        console.log(`Delaying ${time} milliseconds between requests`);
        return Bluebird.delay(time, data);
    };
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

function filterLines(entry) {
    return entry["year"] && (entry["Genres"].length > 0 || entry["Themes"] > 0);
}

function processPage(idx) {
    var continueProcess = false;

    return getPage(idx)
        .then(data => {
            continueProcess = data.length == PAGE_SIZE;

            return data
                .filter(filterLines)
                .map(printCSVLine);
        })
        .then(data => fs.appendFile(OUT_FILE, data.join("\n")))
        .then(delay(1000))
        .then(() => continueProcess && processPage(idx + 1));
}

// Run
deleteOutFile()
    .then(writeHeader, writeHeader)
    .then(() => processPage(0))
    .then(() => console.log("Done"), console.error.bind(console));