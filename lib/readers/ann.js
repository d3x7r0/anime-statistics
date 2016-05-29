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
        .then(data => {
            return [].concat(data["report"]["item"] || [])
                .map(item => `title=${item["id"]}`)
                .join("&");
        })
        .then(Utils.delay())
        .then(ids => fetchXML(SINGLE_URL + ids))
        .then(data => [].concat(data["ann"]["anime"] || [])
            .map(processEntry)
            .reduce((memo, value) => {
                memo = memo.concat(value);
                return memo;
            }, []));
}

function fetchXML(url) {
    console.log(`[${TAG}] Fetching ${url}`);

    return fetch(url)
        .then(res => res.text())
        .then(raw => parseXMLString(raw));
}

const DATE_REGEX = /(\d{4})-?(\d{2})?-?(\d{2})?(?: to (\d{4})-?(\d{2})?-?(\d{2})?)?/;

function processEntry(data) {
    var res, info, startYear, endYear;

    res = data["$"];

    info = [].concat(data["info"] || []);

    res["Vintage"] = getXMLValue(info, "Vintage").pop();

    if (res["Vintage"]) {
        let date = DATE_REGEX.exec(res["Vintage"]);

        if (date) {
            startYear = date[1] && parseInt(date[1], 10) || null;
            endYear = date[4] && parseInt(date[4], 10) || null;

            res["year"] = startYear;
        }
    }

    res["Genres"] = getXMLValue(info, "Genres").map(cleanupGenre);
    res["Themes"] = getXMLValue(info, "Themes").map(cleanupGenre);

    res["Episodes"] = getXMLValue(info, "Number of episodes");
    res["Episodes"] = res["Episodes"] && parseInt(res["Episodes"], 10) || null;

    // Multiple years, we need to split the episode count and generate entries for other years
    if (startYear && endYear && startYear !== endYear) {
        let output = [];
        let yearCount = endYear - startYear + 1;
        let eps = res["Episodes"] && (res["Episodes"] / yearCount | 0) || null;

        for (let y = startYear; y <= endYear; y++) {
            let d = Object.assign({}, res);
            d["year"] = parseInt(y);
            d["Episodes"] = eps;
            output.push(d);
        }

        return output;
    } else {
        return res;
    }
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
    "terrorists": "terrorism",
    "catgirls": "cat girls",
    "superhero": "super hero"
};

var synonyms = {};

function cleanupGenre(entry) {
    var res = slug(entry, " ");

    res = res.toLowerCase().trim();

    if (KNOWN_SYNONYMS[res]) {
        return KNOWN_SYNONYMS[res];
    }

    if (synonyms[res]) {
        return synonyms[res];
    }

    if (res.charAt(res.length - 1) === "s") {
        synonyms[res] = res;
        synonyms[res.substring(0, res.length - 1)] = res;
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

