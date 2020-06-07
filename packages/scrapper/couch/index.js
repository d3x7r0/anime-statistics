const nano = require('nano')

const _design = require('./design')

const TAG = 'COUCH'

function reloadViews(settings) {
  const n = nano(`${settings.connection}`)
  const db = n.use(settings.storeName)

  console.info(`[${TAG}] Adding design views`)

  const docs = Object
    .keys(_design)
    .map((value) => ({
      _id: `_design/${value}`,
      language: 'javascript',
      views: _design[value],
    }))

  return Promise.all(
    docs.map((d) => db.insert(d)),
  )
}

module.exports = {
  reloadViews,
}
