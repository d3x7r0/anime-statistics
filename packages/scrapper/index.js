const CONFIG = require('./config')
const Sukurapa = require('./lib/runner')

function buildWriter() {
  const Constructor = require(`./writers/${CONFIG.writer.name}`)

  if (!Constructor) throw new Error('Unknown writer')

  return new Constructor(CONFIG.writer.options)
}

function buildReader() {
  const Constructor = require(`./readers/${CONFIG.reader.name}`)

  if (!Constructor) throw new Error('Unknown reader')

  return new Constructor(CONFIG.reader.options)
}

const reader = buildReader()
const writer = buildWriter()

const runner = new Sukurapa({
  reader: reader,
  writer: writer,
})

runner
  .run()
  .then(function updateViews() {
    if (CONFIG.writer.name === 'couch') {
      const Couch = require('./couch')

      Couch.reloadViews(CONFIG.writer.options)
    }

    return undefined
  })
  .catch(err => {
    console.error('Error during run', err)
    process.exit(1)
  })
