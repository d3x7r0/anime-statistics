let CONFIG = require("./config");

if (CONFIG.log.level) {
    require('winston').level = CONFIG.log.level;
}

function buildWriter() {
    let Constructor;

    if (CONFIG.writer.name === 'couch') {
        Constructor = require('@sukurapa/writer-couch');
    }

    if (CONFIG.writer.name === 'csv') {
        Constructor = require('@sukurapa/writer-csv');
    }

    if (!Constructor) throw new Error("Unknown writer");

    return new Constructor(CONFIG.writer.options);
}

function buildReader() {
    const Constructor = require(`./readers/${CONFIG.reader.name}`);

    if (!Constructor) throw new Error("Unknown reader");

    return new Constructor(CONFIG.reader.options);
}

const reader = buildReader();
const writer = buildWriter();

const Sukurapa = require("sukurapa");

const runner = new Sukurapa({
    reader: reader,
    writer: writer
});

runner.run().then(function updateViews() {
    if (CONFIG.writer.name === "couch") {
        let Couch = require('./couch');

        Couch.reloadViews(CONFIG.writer.options);
    }
});