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

    return fetchPage(i)
        .then(fetchEntries)
        .then(data => {
            return Promise.all(
                [].concat(data["ann"]["anime"] || [])
                    .map(processEntry)
            );
        })
        .then(data => data
            .map(multiplyEntries)
            .reduce((memo, value) => {
                memo = memo.concat(value);
                return memo;
            }, [])
        );
}

function fetchPage(page) {
    let url = LIST_URL.replace("{limit}", "" + PAGE_SIZE).replace("{offset}", "" + (page * PAGE_SIZE));

    return Utils.queue(fetchXML, url).then(data => {
        return [].concat(data["report"]["item"] || [])
            .map(item => item["id"]);
    });
}

function fetchEntries(ids) {
    let params = [].concat(ids || [])
        .map(id => `title=${id}`)
        .join("&");

    return Utils.queue(fetchXML, SINGLE_URL + params);
}

function fetchXML(url) {
    console.log(`[${TAG}] Fetching ${url}`);

    return fetch(url)
        .then(res => res.text())
        .then(raw => parseXMLString(raw));
}

const DATE_REGEX = /(\d{4})-?(\d{2})?-?(\d{2})?(?: to (\d{4})-?(\d{2})?-?(\d{2})?)?/;

function processEntry(data) {
    var output, res, info;

    res = data["$"];

    info = [].concat(data["info"] || []);

    res["Vintage"] = getXMLValue([].concat(data["info"] || []), "Vintage").pop();

    if (res["Vintage"]) {
        let date = DATE_REGEX.exec(res["Vintage"]);

        if (date) {
            res["year"] = date[1] && parseInt(date[1], 10) || null;
            res["endYear"] = date[4] && parseInt(date[4], 10) || null;
        }
    }

    res["Genres"] = getXMLValue(info, "Genres").map(cleanupGenre);
    res["Themes"] = getXMLValue(info, "Themes").map(cleanupGenre);

    res["Episodes"] = getXMLValue(info, "Number of episodes");
    res["Episodes"] = res["Episodes"] && parseInt(res["Episodes"], 10) || null;

    if (data["related-prev"]) {
        let relations = data["related-prev"]
            .map(entry => entry["$"] && entry["$"]["rel"] && entry["$"]["rel"].toLowerCase())
            .filter(entry => !!entry);

        res["isSequel"] = contains(relations, item => item.indexOf("sequel") !== -1);
        res["isAdaptation"] = contains(relations, item => item.indexOf("adapted") !== -1);
        res["isSpinOff"] = contains(relations, item => item.indexOf("spinoff") !== -1);
        res["isCompilation"] = contains(relations, item => item.indexOf("compilation") !== -1);
        res["isSideStory"] = contains(relations, item => item.indexOf("side story") !== -1);

        // store to check if we missed something after a full run
        res["related-prev"] = relations;
    }

    if (res["isAdaptation"]) {
        // TODO: fetch adaptation info
        res["sources"] = data["related-prev"]
            .map(entry => entry["$"])
            .filter(entry => entry.rel && entry.rel.indexOf("adapted") !== -1)
            .map(entry => entry.id);

        output = fetchEntries(res["sources"]).then(data => {
            res["sources"] = data["ann"] && Object.keys(data["ann"])
                    .filter((entry, idx, arr) => arr.indexOf(entry) === idx);

            return res;
        });
    } else {
        output = res;
    }

    return output;
}

function multiplyEntries(res) {
    // Multiple years, we need to split the episode count and generate entries for other years
    var startYear, endYear;

    startYear = res["startYear"];
    endYear = res["endYear"];

    if (startYear && endYear && startYear !== endYear) {
        let output = [];
        let yearCount = endYear - startYear + 1;
        let eps = res["Episodes"] && Math.floor(res["Episodes"] / yearCount) || null;

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

function contains(arr, fn, ctx) {
    var k, found;

    for (k in arr) {
        if (arr.hasOwnProperty(k)) {
            found = fn.call(ctx || null, arr[k], k, arr);

            if (found) {
                return true;
            }
        }
    }

    return false;
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

