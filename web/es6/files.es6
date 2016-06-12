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

function fetchTotalsFiltered(file, start, end) {
    return fetchFile(file).then(function (data) {
        data.rows = data.rows.filter(function (entry) {
            return entry.key >= start && entry.key <= end;
        });

        return data;
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

function fetchAllShows(start, end) {
    return fetchTotalsFiltered("totals.json", start, end);
}

function fetchEpisodeData(start, end) {
    return fetchTotalsFiltered("episode_totals.json", start, end);
}

function getData(key) {
    return getFilteredDataFile("data.json", key);
}

function getEpisodeData(key) {
    return getFilteredDataFile("episode_data.json", key);
}

function getGenreData(type) {
    return fetchFile(type + ".json");
}

function getYearData(type, year) {
    return getFilteredDataFile("data_" + type + ".json", parseInt(year, 10));
}

function getTypes(year) {
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