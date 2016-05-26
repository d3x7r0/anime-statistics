/* global emit:false */

module.exports = {
    genres: {
        byYear: {
            map: function (doc) {
                if (!doc["year"]) {
                    return;
                }

                doc["Genres"].forEach(function (entry) {
                    emit([doc["year"], entry], doc);
                });

                doc["Themes"].forEach(function (entry) {
                    emit([doc["year"], entry], doc);
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
                    emit(entry, doc);
                });

                doc["Themes"].forEach(function (entry) {
                    emit(entry, doc);
                });
            },
            reduce: "_count"
        }
    }
};