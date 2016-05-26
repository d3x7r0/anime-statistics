var Utils = require('./utils'),
    Writer = require("./writers/csv"),
    Reader = require("./readers/ann");

function filterLines(entry) {
    return entry["year"] && (entry["Genres"].length > 0 || entry["Themes"] > 0);
}

function processPage(idx) {
    var continueProcess = false;

    return Reader.getPage(idx)
        .then(data => {
            continueProcess = data.length == Reader.PAGE_SIZE;
            return data.filter(filterLines);
        })
        .then(Writer.save)
        .then(Utils.delay())
        .then(() => continueProcess && processPage(idx + 1));
}

// Run
Writer.prepare()
    .then(() => processPage())
    .then(() => console.log("Done"), console.error.bind(console));