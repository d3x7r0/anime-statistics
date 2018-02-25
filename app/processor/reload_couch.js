let CONFIG = require('./config');

let Couch = require('./couch');

Couch.reloadViews(CONFIG.writer.options);
