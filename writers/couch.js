var nano = require("nano"),
    slug = require("slug"),
    Bluebird = require("bluebird");

const CONNECTION = "http://localhost:5984";
const STORE_NAME = "ann";

const TAG = "COUCH";

nano = nano(`${CONNECTION}`);

const destroy = Bluebird.promisify(nano.db.destroy);
const create = Bluebird.promisify(nano.db.create);

var db,
    insert,
    bulkInsert;

function prepare() {
    console.log(`[${TAG}] Preparing output couchdb store "${STORE_NAME}"`);

    return destroy(STORE_NAME)
        .then(() => create(STORE_NAME), () => create(STORE_NAME))
        .then(() => {
            db = nano.use(STORE_NAME);
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