/* global emit:false */

module.exports = {
    genres: {
        byYear: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit([doc["year"], entry.toLowerCase()], doc);
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
                    emit([entry.toLowerCase(), doc["year"]], doc);
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
                    emit(entry.toLowerCase(), doc);
                });
            },
            reduce: "_count"
        }
    },
    themes: {
        byYear: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Themes"].forEach(function (entry) {
                    emit([doc["year"], entry.toLowerCase()], doc);
                });
            },
            byKey: {
                map: function (doc) {
                    if (!doc["year"]) {
                        return;
                    }

                    doc["Themes"].forEach(function (entry) {
                        emit([entry.toLowerCase(), doc["year"]], doc);
                    });
                },
                reduce: "_count"
            },
            reduce: "_count"
        },
        all: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Themes"].forEach(function (entry) {
                    emit(entry.toLowerCase(), doc);
                });
            },
            reduce: "_count"
        }
    },
    aggregated: {
        byYear: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit([doc["year"], entry.toLowerCase()], doc);
                });

                doc["Themes"].forEach(function (entry) {
                    emit([doc["year"], entry.toLowerCase()], doc);
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
                    emit([entry.toLowerCase(), doc["year"]], doc);
                });

                doc["Themes"].forEach(function (entry) {
                    emit([entry.toLowerCase(), doc["year"]], doc);
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
                    emit(entry.toLowerCase(), doc);
                });

                doc["Themes"].forEach(function (entry) {
                    emit(entry.toLowerCase(), doc);
                });
            },
            reduce: "_count"
        }
    }
};