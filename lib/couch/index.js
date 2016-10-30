let nano = require("nano"),
    Logger = require('winston'),
    Bluebird = require("bluebird");

let _design = require("./design");

const TAG = "COUCH";

function reloadViews(settings) {
    let n, db, insert;

    n = nano(`${settings.connection}`);
    db = n.use(settings.storeName);
    insert = Bluebird.promisify(db.insert);

    Logger.info(`[${TAG}] Adding design views`);

    let docs = Object
        .keys(_design)
        .map((value) => ({
            _id: `_design/${value}`,
            language: "javascript",
            views: _design[value]
        }));

    return Bluebird.all(
        docs.map((d) => insert(d))
    );
}

module.exports = {
    reloadViews: reloadViews
};