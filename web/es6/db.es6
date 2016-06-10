const DATABASE_LOCATION = "http://127.0.0.1:5984/ann/";

function fetchDB(design, view, startKey, endKey) {
    var url = [
        `${DATABASE_LOCATION}/_design/${design}/_view/${view}?group=true`
    ];

    if (startKey) {
        url.push(`startkey=${startKey}`);
    }

    if (endKey) {
        url.push(`endkey=${endKey}`);
    }

    return fetch(
        url.join("&")
    ).then(res => res.json());
}

function fetchAllShows(start, end) {
    return fetchDB("aggregated", "all", start, end);
}

function fetchEpisodeData(start, end) {
    return fetchDB("aggregated", "episodes", start, end);
}

function getData(key) {
    return fetchDB("aggregated", "byKey", `["${key}"]`, `["${key}", {}]`);
}

function getEpisodeData(key) {
    return fetchDB("aggregated", "episodesByKey", `["${key}"]`, `["${key}", {}]`);
}

function getGenreData(type) {
    return fetchDB(type, "all");
}

function getYearData(type, year) {
    return fetchDB(type, "byYear", `[${year}]`, `[${year}, {}]`);
}

export default {
    fetchAllShows: fetchAllShows,
    fetchEpisodeData: fetchEpisodeData,
    getData: getData,
    getEpisodeData: getEpisodeData,
    getGenreData: getGenreData,
    getYearData: getYearData
};