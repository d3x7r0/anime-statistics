const DATA_FOLDER = "data/";

var FILES = {};

function fetchFile(file) {
    if (FILES[file]) {
        return Promise.resolve(
            Object.assign({}, FILES[file])
        );
    }

    if (console && console.debug) {
        console.debug('Fetching file "%s"', file);
    }

    return fetch(DATA_FOLDER + file)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            FILES[file] = data;
            return Object.assign({}, FILES[file]);
        });
}

function getFilteredDataFile(file, entry) {
    return fetchFile(file)
        .then(function (data) {
            data.rows = data.rows.filter(function (e) {
                return e.key[0] === entry;
            });

            return data;
        });
}

// url: /_design/aggregated/_view/all?group=true
function fetchAllShows(start, end) {
    console.debug("Fetching all shows", start, end);

    return fetchFile("totals.json").then(function (data) {
        data.rows = data.rows.filter(function (entry) {
            return entry.key >= start && entry.key <= end;
        });

        return data;
    });
}

// url: /_design/aggregated/_view/episodesByType?group=true
function fetchEpisodeData(start, end) {
    console.debug("Fetching episode data", start, end);

    return fetchFile("episode_totals.json").then(function (data) {
        data.rows = data.rows.filter(function (entry) {
            return entry.key[0] >= start && entry.key[0] <= end;
        });

        return data;
    });
}

// url: /_design/aggregated/_view/byKey?group=true
function getData(key) {
    console.debug("Fetching aggregated data", key);

    return getFilteredDataFile("data.json", key);
}

// url: /_design/aggregated/_view/episodesByKeyAndType?group=true
function getEpisodeData(key) {
    console.debug("Fetching episode data", key);

    return getFilteredDataFile("episode_data.json", key);
}

// url: /_design/genre/_view/all?group=true
// url: /_design/themes/_view/all?group=true
function getGenreData(type) {
    console.debug("Fetching genre data", type);

    return fetchFile(type + ".json");
}

// url: /_design/genres/_view/byYear?group=true
// url: /_design/themes/_view/byYear?group=true
function getYearData(type, year) {
    console.debug("Fetching year data", type, year);

    return getFilteredDataFile("data_" + type + ".json", parseInt(year, 10));
}

// url: /_design/types/_view/byYear?group=true
function getTypes(year) {
    console.debug("Fetching types data", year);

    return getFilteredDataFile("types.json", parseInt(year, 10));
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