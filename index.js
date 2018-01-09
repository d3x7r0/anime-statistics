let CONFIG = require("./config");

if (CONFIG.log.level) {
    require('winston').level = CONFIG.log.level;
}

let reader = require(`./lib/readers/${CONFIG.reader.name}`)(CONFIG.reader.options);

let runner = require("sukurapa")({
    reader: reader,
    writer: CONFIG.writer
});

runner.run().then(function updateViews() {
    if (CONFIG.writer.name === "couch") {
        let Couch = require('./lib/couch');

        Couch.reloadViews(CONFIG.writer.options);
    }
});