const DATABASE_LOCATION = "http://127.0.0.1:5984/ann/";

function fetchDB(design, view, startKey, endKey) {
    var parts = [
        `${DATABASE_LOCATION}/_design/${design}/_view/${view}?group=true`
    ];

    if (startKey) {
        parts.push(`startkey=${startKey}`);
    }

    if (endKey) {
        parts.push(`endkey=${endKey}`);
    }

    let url = parts.join("&");

    if (console && console.debug) {
        console.debug("Fetching url: %s", url);
    }

    return fetch(url).then(res => res.json());
}

function fetchSingle(design, view, key) {
    let k = JSON.stringify(key);

    return fetchDB(design, view, `[${k}]`, `[${k}, {}]`);
}

function fetchAllShows(start, end) {
    return fetchDB("aggregated", "all", start, end);
}

function fetchEpisodeData(start, end) {
    return fetchDB("aggregated", "episodes", start, end);
}

function getData(key) {
    return fetchSingle("aggregated", "byKey", key);
}

function getEpisodeData(key) {
    return fetchSingle("aggregated", "episodesByKey", key);
}

function getGenreData(type) {
    return fetchDB(type, "all");
}

function getYearData(type, year) {
    return fetchSingle(type, "byYear", parseInt(year, 10));
}

function getTypes(year) {
    return fetchSingle("types", "byYear", parseInt(year, 10));
}

export default {
    fetchAllShows: fetchAllShows,
    fetchEpisodeData: fetchEpisodeData,
    getData: getData,
    getEpisodeData: getEpisodeData,
    getGenreData: getGenreData,
    getYearData: getYearData,
    getTypes: getTypes
};