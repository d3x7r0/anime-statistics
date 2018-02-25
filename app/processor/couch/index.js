const nano = require("nano");
const Logger = require('winston');
const {promisify} = require('util');

const _design = require("./design");

const TAG = "COUCH";

function reloadViews(settings) {
    let n, db, insert;

    n = nano(`${settings.connection}`);
    db = n.use(settings.storeName);
    insert = promisify(db.insert);

    Logger.info(`[${TAG}] Adding design views`);

    let docs = Object
        .keys(_design)
        .map((value) => ({
            _id: `_design/${value}`,
            language: "javascript",
            views: _design[value]
        }));

    return Promise.all(
        docs.map((d) => insert(d))
    );
}

module.exports = {
    reloadViews
};