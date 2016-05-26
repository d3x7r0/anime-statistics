var pkg = require("../package.json");

const DEFAULTS = {
    writers: {
        csv: {
            out_file: "out.csv",
            stats_file: "stats.csv",
            separator: ", ",
            line_separator: "\n"
        },
        couch: {
            connection: "http://localhost:5984",
            store_name: "ann"
        }
    },
    writer: "couch",
    delay: 1000
};

module.exports = require("rc")(pkg.name, DEFAULTS);