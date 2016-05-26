var nano = require("nano"),
    slug = require("slug"),
    Bluebird = require("bluebird");

var _design = require("./design");

var CONFIG = require("../../config")["writers"]["couch"];

const TAG = "COUCH";

nano = nano(`${CONFIG.connection}`);

const destroy = Bluebird.promisify(nano.db.destroy);
const create = Bluebird.promisify(nano.db.create);

var db,
    insert,
    bulkInsert;

function prepare() {
    console.log(`[${TAG}] Preparing output couchdb store "${CONFIG.store_name}"`);

    return destroy(CONFIG.store_name)
        .then(() => create(CONFIG.store_name), () => create(CONFIG.store_name))
        .then(() => {
            db = nano.use(CONFIG.store_name);
            insert = Bluebird.promisify(db.insert);
            bulkInsert = Bluebird.promisify(db.bulk);
        });
}

function prepareEntry(entry) {
    return Object.assign({}, entry, {
        _id: buildId(entry)
    });
}

function buildId(entry) {
    var name = slug(entry["name"]);

    return `${ entry["year"] }/${ name }`;
}

function save(data) {
    console.log(`[${TAG}] Writing ${data.length} lines`);

    return bulkInsert({
        docs: data.map(prepareEntry)
    });
}

var statsRevId = undefined;

function updateStats(stats) {
    console.log(`[${TAG}] Updating status`);

    var data = Object.assign({}, stats, {
        _id: "STATS",
        _rev: statsRevId
    });

    return insert(data).then((res) => {
        statsRevId = res["rev"];
    });
}

function setupDesignViews() {
    console.log(`[${TAG}] Adding design views`);

    var docs = Object
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

function finish(stats) {
    return updateStats(stats)
        .then(setupDesignViews);
}

module.exports = {
    prepare: prepare,
    save: save,
    finish: finish,
    updateStats: updateStats
};