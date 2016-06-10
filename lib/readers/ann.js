// http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist=50&nskip=0&type=anime
// http://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=1&title=2... max: 50

var Utils = require("./../utils"),
    fetch = require("node-fetch"),
    xml2js = require("xml2js"),
    Bluebird = require("bluebird"),
    slug = require("slug");

const TAG = "ANN";

const LIST_URL = (limit, offset) => `http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist=${limit}&nskip=${offset}&type=anime`;
const SINGLE_URL = "http://cdn.animenewsnetwork.com/encyclopedia/api.xml?";
const PAGE_SIZE = 50;
const MAX_EPISODES_PER_YEAR = 52;

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
        .then(processRelations)
        .then(data => data
            .map(multiplyEntries)
            .reduce((memo, value) => {
                memo = memo.concat(value);
                return memo;
            }, [])
        );
}

function fetchPage(page) {
    let url = LIST_URL(PAGE_SIZE, page * PAGE_SIZE);

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
    let res, info;

    res = data["$"];

    info = [].concat(data["info"] || []);

    res["Vintage"] = getXMLValue([].concat(data["info"] || []), "Vintage");

    if (res["Vintage"] && res["Vintage"].length) {
        let date = pickDate(res["Vintage"]);

        if (date) {
            res["year"] = date["start"];
            res["startYear"] = res["year"];
            res["endYear"] = date["end"];
        }
    }

    res["Genres"] = getXMLValue(info, "Genres").map(cleanupGenre);
    res["Themes"] = getXMLValue(info, "Themes").map(cleanupGenre);

    res["Episodes"] = getXMLValue(info, "Number of episodes");
    res["Episodes"] = res["Episodes"] && parseInt(res["Episodes"], 10) || null;

    let runtime = getXMLValue(info, "Running time").pop() || null;
    res["Runtime"] = parseInt(runtime, 10) || null;

    // Try to guess runtime if missing
    if (!res["Runtime"] && res["type"]) {
        let type = (res["type"] || "").toLowerCase();

        if (type === "tv") {
            res["Runtime"] = 25;
        } else if (type === "ona") {
            res["Runtime"] = 15;
        } else if (type === "ova" || type === "oav") {
            res["Runtime"] = 30;
        } else if (type === "movie") {
            res["Runtime"] = 60;
        }
    }

    if (data["related-prev"]) {
        let relations = data["related-prev"]
            .map(entry => entry["$"] && entry["$"]["rel"] && entry["$"]["rel"].toLowerCase())
            .filter(entry => !!entry);

        res["sequel"] = contains(relations, item => item.indexOf("sequel") !== -1);
        res["adaptation"] = contains(relations, item => item.indexOf("adapted") !== -1);
        res["spinOff"] = contains(relations, item => item.indexOf("spinoff") !== -1);
        res["compilation"] = contains(relations, item => item.indexOf("compilation") !== -1);
        res["sideStory"] = contains(relations, item => item.indexOf("side story") !== -1);
        res["remake"] = contains(relations, item => item.indexOf("remake") !== -1 || item.indexOf("alternate retelling") !== -1);

        // store to check if we missed something after a full run
        res["related-prev"] = data["related-prev"].map(entry => entry["$"] && entry["$"]["rel"]);
    }

    if (res["adaptation"]) {
        res["sources"] = data["related-prev"]
            .map(entry => entry["$"])
            .filter(entry => entry.rel && entry.rel.indexOf("adapted") !== -1)
            .map(entry => entry.id);
    }

    return res;
}

function pickDate(vintage) {
    // TODO: we should be smarter when picking the date. Some shows have pre-air times, others have overseas dates
    return vintage
        .map(v => DATE_REGEX.exec(v))
        .map(date => ({
            start: date[1] && parseInt(date[1], 10) || null,
            end: date[4] && parseInt(date[4], 10) || null
        }))
        .shift();
}

function processRelations(entries) {
    let ids = entries
        .map(entry => entry.sources)
        .reduce((memo, sources) => memo.concat(sources || []), [])
        .filter((entry, idx, arr) => arr.indexOf(entry) === idx);

    if (ids.length === 0) {
        return entries;
    }

    let pages = Math.ceil(ids.length / PAGE_SIZE);

    let p = [];

    for (let i = 0; i < pages; i++) {
        let sub = ids.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE);

        p.push(
            fetchEntries(sub).then(raw => {
                let data = raw["ann"] || {};

                return Object.keys(data)
                    .map(key => data[key] || [])
                    .reduce((memo, entry) => memo.concat(entry), [])
                    // We need to filter entries because sometimes an id is non-existing
                    // despite the fact that it's listed as related
                    .map(entry => entry["$"])
                    .filter(entry => !!entry);
            })
        );
    }

    return Bluebird.all(p).then(data => {
        let map = data
            .reduce((memo, entry) => memo.concat(entry || []), [])
            .reduce((memo, data) => {
                memo[data["id"]] = data["type"] || data["precision"];
                return memo;
            }, {});

        entries.forEach(entry => {
            if (entry.sources) {
                entry.sources = entry.sources
                    .map(source => map[source] || "unknown")
                    .filter(entry => !!entry);
            }
        });

        return entries;
    });
}

function multiplyEntries(res) {
    // Multiple years, we need to split the episode count and generate entries for other years
    let startYear, endYear, type, episodes;

    startYear = res["year"];
    endYear = res["endYear"];

    type = (res["type"] || "").toLowerCase();
    episodes = res["Episodes"] || 1;

    // Duplicate if the show passed into the next year AND if it's not a TV show OR the episode count is larger than a full year
    if (startYear && endYear && startYear !== endYear && (type !== "tv" || episodes > MAX_EPISODES_PER_YEAR)) {
        let output = [];
        let yearCount = endYear - startYear;
        let eps = episodes > 1 ? Math.floor(episodes / yearCount) : 1;

        let i = 0;
        for (let y = startYear; y <= endYear; y++) {
            let d = Object.assign({}, res);
            d["year"] = parseInt(y);
            d["Episodes"] = eps;

            // Add the sequel tag to the duplicates
            if (i > 0) {
                d["sequel"] = true;
            }

            output.push(d);
            i++;
        }

        return output;
    } else {
        return res;
    }
}

function contains(arr, fn, ctx) {
    let k, found;

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
    let res = slug(entry, " ");

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

