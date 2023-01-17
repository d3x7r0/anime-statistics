const fs = require("node:fs")
const {promisify} = require('node:util')

const TAG = "CVS"

const DEFAULT_DELETE_FILE = false

const DEFAULT_SEPARATOR = ","
const DEFAULT_LINE_SEPARATOR = "\n"
const DEFAULT_ARRAY_SEPARATOR = ";"

const deleteFile = promisify(fs.unlink)
const appendFile = promisify(fs.appendFile)

class CSVWriter {
  #outFile = null
  #statsFile = null

  #columns = []

  #separator = DEFAULT_SEPARATOR
  #lineSeparator = DEFAULT_LINE_SEPARATOR
  #arraySeparator = DEFAULT_ARRAY_SEPARATOR

  #deleteOnStart = DEFAULT_DELETE_FILE

  #warned = false

  constructor({
    outFile,
    statsFile,
    columns = [],
    separator = DEFAULT_SEPARATOR,
    lineSeparator = DEFAULT_LINE_SEPARATOR,
    arraySeparator = DEFAULT_ARRAY_SEPARATOR,
    deleteOnStart = DEFAULT_DELETE_FILE
  } = {}) {

    if (!outFile) {
      throw new Error(`[${TAG}] Missing out file`)
    }

    if (!statsFile) {
      throw new Error(`[${TAG}] Missing stats file`)
    }

    this.#outFile = outFile
    this.#statsFile = statsFile

    this.#columns = [
      {prop: "id"},
      ...(columns || [])
    ]

    this.#separator = separator
    this.#lineSeparator = lineSeparator
    this.#arraySeparator = arraySeparator

    this.#deleteOnStart = deleteOnStart
  }

  async prepare() {
    console.info(`[${TAG}] Preparing output file "${this.#outFile}"`)

    this.#warned = false

    if (this.#deleteOnStart) {
      await deleteFile(this.#outFile)
    }

    return await this.#writeHeader()
  }

  async save(data) {
    console.info(`[${TAG}] Writing ${data.length} lines to file`)

    const res = data.map(this.#printCSVLine.bind(this)).join(this.#lineSeparator)

    if (res.length) {
      await appendFile(this.#outFile, res + this.#lineSeparator)
    }

    return res.length
  }

  async finish(stats) {
    const keys = Object.keys(stats)

    let res = keys.join(this.#separator)
    res += this.#lineSeparator + " "
    res += keys
      .map((k) => stats[k])
      .join(this.#separator)

    return await this.#writeStatsFile(res)
  }

  #writeHeader() {
    const headers = this.#columns.map(entry => entry.title || entry.prop)

    return appendFile(this.#outFile, headers.join(this.#separator) + this.#lineSeparator)
  }

  #printCSVLine(entry) {
    return this.#columns
      .map(entry => entry.prop)
      .map(
        prop => Array.isArray(entry[prop]) ?
          entry[prop].join(this.#arraySeparator) :
          entry[prop] || "--"
      )
      .join(this.#separator)
  }

  updateStats() {
    if (this.#warned) {
      return
    }

    this.#warned = true
    console.warn(`[${TAG}] CVS writer doesn't support stats updates. All stats will be writen at the end`)
  }

  async #writeStatsFile(data) {
    if (this.#deleteOnStart) {
      await deleteFile(this.#statsFile)
    }

    return await appendFile(this.#statsFile, data)
  }
}

module.exports = CSVWriter
