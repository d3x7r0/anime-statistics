/* global emit:false */

module.exports = {
    genres: {
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
        },
        byKey: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
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

                doc["Genres"].forEach(function (entry) {
                    emit(entry.toLowerCase(), 1);
                });
            },
            reduce: "_count"
        },
        "episodesByKey": {
            "map": function (doc) {
                if (!doc["year"] || !doc["Episodes"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit(entry.toLowerCase(), doc["Episodes"]);
                });
            },
            "reduce": "_stats"
        },
        "episodesByYear": {
            "map": function (doc) {
                if (!doc["year"] || !doc["Episodes"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit([entry.toLowerCase(), doc["year"]], doc["Episodes"]);
                });
            },
            "reduce": "_stats"
        }
    },
    themes: {
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
        },
        byKey: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

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

                doc["Themes"].forEach(function (entry) {
                    emit(entry.toLowerCase(), 1);
                });
            },
            reduce: "_count"
        },
        "episodesByKey": {
            "map": function (doc) {
                if (!doc["year"] || !doc["Episodes"]) {
                    return;
                }

                doc["Themes"].forEach(function (entry) {
                    emit(entry.toLowerCase(), doc["Episodes"]);
                });
            },
            "reduce": "_stats"
        },
        "episodesByYear": {
            "map": function (doc) {
                if (!doc["year"] || !doc["Episodes"]) {
                    return;
                }

                doc["Themes"].forEach(function (entry) {
                    emit([entry.toLowerCase(), doc["year"]], doc["Episodes"]);
                });
            },
            "reduce": "_stats"
        }
    },
    aggregated: {
        byYear: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit([doc["year"], entry.toLowerCase()], 1);
                });

                doc["Themes"].forEach(function (entry) {
                    emit([doc["year"], entry.toLowerCase()], 1);
                });
            },
            reduce: "_count"
        },
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

                doc["Genres"].forEach(function (entry) {
                    emit(entry.toLowerCase(), 1);
                });

                doc["Themes"].forEach(function (entry) {
                    emit(entry.toLowerCase(), 1);
                });
            },
            reduce: "_count"
        },
        count: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                emit(doc["year"], 1);
            },
            reduce: "_sum"
        },
        "episodesByKey": {
            "map": function (doc) {
                if (!doc["year"] || !doc["Episodes"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit(entry.toLowerCase(), doc["Episodes"]);
                });

                doc["Themes"].forEach(function (entry) {
                    emit(entry.toLowerCase(), doc["Episodes"]);
                });
            },
            "reduce": "_stats"
        },
        "episodesByYear": {
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