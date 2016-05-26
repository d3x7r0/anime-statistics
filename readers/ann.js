// http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist=50&nskip=0&type=anime
// http://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=1&title=2... max: 50

var Utils = require('./../utils'),
    fetch = require("node-fetch"),
    xml2js = require("xml2js"),
    Bluebird = require("bluebird");

const TAG = "ANN";

const LIST_URL = "http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist={limit}&nskip={offset}&type=anime";
const SINGLE_URL = "http://cdn.animenewsnetwork.com/encyclopedia/api.xml?";
const PAGE_SIZE = 50;

const parseXMLString = Bluebird.promisify(xml2js.parseString);

function getPage(i) {
    console.log(`[${TAG}] Fetching page ${i}`);

    return fetchXML(LIST_URL.replace("{limit}", "" + PAGE_SIZE).replace("{offset}", "" + (i * PAGE_SIZE)))
        .then(data => data["report"]["item"]
            .map(i => `title=${i["id"]}`)
            .join("&")
        )
        .then(Utils.delay())
        .then(ids => fetchXML(SINGLE_URL + ids))
        .then(data => data["ann"]["anime"].map(cleanupEntry));
}

function fetchXML(url) {
    console.log(`[${TAG}] Fetching ${url}`);

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
            res["year"] = parseInt(date[1], 10);
            res["month"] = parseInt(date[2], 10);
        }
    }

    res["Genres"] = getXMLValue(info, "Genres");
    res["Themes"] = getXMLValue(info, "Themes");

    res["Episodes"] = getXMLValue(info, "Number of episodes");
    res["Episodes"] = res["Episodes"] && parseInt(res["Episodes"], 10);

    return res;
}

function getXMLValue(data, value) {
    return data
        .filter(i => i["$"]["type"] === value)
        .map(d => d["_"])
        .filter(v => !!v);
}

module.exports = {
    getPage: getPage,
    PAGE_SIZE: PAGE_SIZE
};

