/* global emit:false */

module.exports = {
    sources: {
        all: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                if (doc["sources"] && doc["sources"].length) {
                    doc["sources"].forEach(function (entry) {
                        emit(entry.toLowerCase(), 1);
                    });
                } else {
                    emit("original", 1);
                }
            },
            reduce: "_count"
        },
        byYear: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                if (doc["sources"] && doc["sources"].length) {
                    doc["sources"].forEach(function (entry) {
                        emit([doc["year"], entry.toLowerCase()], 1);
                    });
                } else {
                    emit([doc["year"], "original"], 1);
                }
            },
            reduce: "_count"
        }
    },
    genres: {
        all: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit(entry.toLowerCase(), 1);
                });
            },
            reduce: "_count"
        },
        byYear: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit([doc["year"], entry.toLowerCase()], 1);
                });
            },
            reduce: "_count"
        }
    },
    themes: {
        all: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Themes"].forEach(function (entry) {
                    emit(entry.toLowerCase(), 1);
                });
            },
            reduce: "_count"
        },
        byYear: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Themes"].forEach(function (entry) {
                    emit([doc["year"], entry.toLowerCase()], 1);
                });
            },
            reduce: "_count"
        }
    },
    aggregated: {
        byKey: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit([entry.toLowerCase(), doc["year"]], 1);
                });

                doc["Themes"].forEach(function (entry) {
                    emit([entry.toLowerCase(), doc["year"]], 1);
                });
            },
            reduce: "_count"
        },
        all: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                emit(doc["year"], 1);
            },
            reduce: "_count"
        },
        "episodes": {
            "map": function (doc) {
                if (!doc["year"] || !doc["Episodes"]) {
                    return;
                }

                emit(doc["year"], doc["Episodes"]);
            },
            "reduce": "_stats"
        },
        "episodesByKey": {
            "map": function (doc) {
                if (!doc["year"] || !doc["Episodes"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit([entry.toLowerCase(), doc["year"]], doc["Episodes"]);
                });

                doc["Themes"].forEach(function (entry) {
                    emit([entry.toLowerCase(), doc["year"]], doc["Episodes"]);
                });
            },
            "reduce": "_stats"
        }
    }
};