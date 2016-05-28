// http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist=50&nskip=0&type=anime
// http://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=1&title=2... max: 50

var Utils = require("./../utils"),
    fetch = require("node-fetch"),
    xml2js = require("xml2js"),
    Bluebird = require("bluebird"),
    slug = require("slug");

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

    res["Genres"] = getXMLValue(info, "Genres").map(cleanupGenre);
    res["Themes"] = getXMLValue(info, "Themes").map(cleanupGenre);

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

const KNOWN_SYNONYMS = {
    "shonen": "shounen",
    "bishojo": "bishoujo",
    "bishonen": "bishounen",
    "crossdressing": "cross dressing",
    "fanservice": "fan service",
    "immortality": "immortal",
    "robots": "robotics",
    "succubi": "succubus",
    "terrorists": "terrorism"
};

var synonyms = {};

function cleanupGenre(entry) {
    var res = slug(entry, " ");

    res = res.trim();

    if (KNOWN_SYNONYMS[res]) {
        return KNOWN_SYNONYMS[res];
    }

    if (synonyms[res]) {
        return synonyms[res];
    }

    if (res.charAt(res.length - 1) === "s") {
        synonyms[res] = res;
        synonyms[res.substring(0, -1)] = res;
    } else {
        synonyms[res + "s"] = res;
        synonyms[res] = res;
    }

    return res;
}

module.exports = {
    getPage: getPage,
    PAGE_SIZE: PAGE_SIZE
};

