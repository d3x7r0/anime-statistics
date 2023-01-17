const nano = require('nano')

const TAG = 'COUCH'

const STATS_KEY_NAME = 'STATS'

const DEFAULT_DELETE_STORE = false

class CouchWriter {
  #storeName = null
  #connection = null

  #statsRevId = undefined

  #deleteOnStart = DEFAULT_DELETE_STORE

  #nano = undefined
  #db = undefined

  constructor({
    connection,
    storeName,
    deleteOnStart = DEFAULT_DELETE_STORE,
  } = {}) {

    if (!connection || !storeName) {
      throw new Error(`[${TAG}] Missing connection or store name`)
    }

    this.#storeName = storeName
    this.#connection = connection

    this.#deleteOnStart = deleteOnStart
  }

  async prepare() {
    console.info(`[${TAG}] Preparing output couchdb store "${this.#storeName}"`)

    this.#nano = nano(`${this.#connection}`)

    this.#db = this.#nano.use(this.#storeName)

    if (this.#deleteOnStart) {
      try {
        await this.#nano.db.destroy(this.#storeName)
      } catch (err) {
        if (err.error !== 'not_found') throw err
      }

      await this.#nano.db.create(this.#storeName)
    } else {
      try {
        await this.#nano.db.create(this.#storeName)
      } catch (err) {
        if (err.error !== 'file_exists') throw err
      }
    }

    try {
      const stats = await this.#db.get(STATS_KEY_NAME)

      this.#statsRevId = stats['_rev']
    } catch (err) {
      if (err.error !== 'not_found') throw err
    }

    return this
  }

  async save(data) {
    console.debug(`[${TAG}] Writing ${data.length} lines`)

    const docs = data
      .filter(filterEntry)
      .map(entry => ({ ...entry, _id: entry['id'] }))

    await this.#db.bulk({ docs: docs })

    return docs.length
  }

  finish(stats) {
    console.info(`[${TAG}] Finishing up`)

    return this.updateStats(stats)
  }

  async updateStats(stats) {
    console.debug(`[${TAG}] Updating status`)

    const data = {
      ...stats,
      _id: STATS_KEY_NAME,
      _rev: this.#statsRevId,
    }

    const res = await this.#db.insert(data)

    this.#statsRevId = res['rev']
  }
}

function filterEntry(entry) {
  if (entry?.id !== undefined) {
    return true
  }

  console.warn(`[${TAG}] Missing entry id, skipping save`, entry)
  return false
}

module.exports = CouchWriter
