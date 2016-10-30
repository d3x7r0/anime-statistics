let CONFIG = require('./config');

let Couch = require('./lib/couch');

Couch.reloadViews(CONFIG.writer.options);
