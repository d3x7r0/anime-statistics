const CONFIG = require('./config')
const Couch = require('./couch')

Couch.reloadViews(CONFIG.writer.options)
  .then(() => console.log('Done'))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
