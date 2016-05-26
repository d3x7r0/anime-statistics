var nano = require("nano"),
    slug = require("slug"),
    Bluebird = require("bluebird");

var CONFIG = require("../config")["writers"]["couch"];

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

    return `${ entry["year"] }/${ entry["month"] }/${ name }`;
}

function save(data) {
    console.log(`[${TAG}] Writing ${data.length} lines to couch`);

    return bulkInsert({
        docs: data.map(prepareEntry)
    });
}

function finish(stats) {
    var data = Object.assign({}, stats, {
        _id: "STATS"
    });

    return insert(data);
}

module.exports = {
    prepare: prepare,
    save: save,
    finish: finish
};