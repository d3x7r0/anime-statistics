// http://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist=50&nskip=0&type=anime
// http://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=1&title=2... max: 50

const fetch = require('isomorphic-fetch')
const xml2js = require('xml2js')
const slugify = require('slugify')
const { promisify } = require('node:util')

const Utils = require('../utils')

const TAG = 'ANN'

const LIST_URL = (limit, offset) => `https://www.animenewsnetwork.com/encyclopedia/reports.xml?id=155&nlist=${limit}&nskip=${offset}&type=anime`
const SINGLE_URL = 'https://cdn.animenewsnetwork.com/encyclopedia/api.xml?'
const START_PAGE = 0
const PAGE_SIZE = 20
const MAX_EPISODES_PER_YEAR = 52

const MAX_RETRIES = 5
const RETRY_DELAY = 1000

const parseXMLString = promisify(xml2js.parseString)

class ANNReader {
  constructor({ startPage = START_PAGE, headers } = {}) {
    this._startPage = startPage
    this._headers = headers || {}
  }

  prepare() {
    this._page = this._startPage
    this._continue = true
  }

  async next() {
    const data = await getPage(this._page)

    this._continue = data.length >= PAGE_SIZE
    this._page++

    return data
  }

  hasNext() {
    return this._continue
  }

  finish() {

  }
}

async function getPage(i) {
  console.debug(`[${TAG}] Fetching page ${i}`)

  const ids = await fetchPage(i)

  return fetchAndProcessEntries(ids)
}

async function fetchPage(page) {
  const url = LIST_URL(PAGE_SIZE, page * PAGE_SIZE)

  const data = await Utils.queue(fetchXML, url)

  return ensureArray(data && data['report'] && data['report']['item'])
    .map(item => item['id'])
}

async function fetchAndProcessEntries(ids) {
  try {
    const data = await fetchEntries(ids)

    return processData(data)
  } catch (err) {
    return fallbackEntriesFetch(ids, err)
  }
}

async function fallbackEntriesFetch(ids, err) {
  console.warn(`[${TAG}] Error fetching entries in bulk, falling back to single requests. \nError: ${err.message}`)

  const data = await Promise.all(
    ids.map(id => fetchAndProcess([id])),
  )

  return flatten(data)
}

async function fetchAndProcess(id) {
  try {
    const data = await fetchEntries([id])

    return processData(data)
  } catch (err) {
    return onEntryError(id, err)
  }
}

async function fetchEntries(ids) {
  const params = ensureArray(ids)
    .map(id => `title=${id}`)
    .join('&')

  const data = await Utils.queue(fetchXML, SINGLE_URL + params)

  return ensureArray(data && data['ann'] && data['ann']['anime'])
}

async function fetchXML(url) {
  console.debug(`[${TAG}] Fetching ${url}`)

  const res = await doGet(url, { headers: this._headers })

  return parseXMLString(
    await res.text(),
  )
}

async function processData(entries) {
  let data = await Promise.all(
    entries.map(processEntry),
  )

  data = await processRelations(data)

  return data
    .map(multiplyEntries)
    .reduce((memo, value) => {
      memo = memo.concat(value)
      return memo
    }, [])
    .map(buildId)
}

function onEntryError(id, err) {
  console.warn(`[${TAG}] Error fetching entry with id [${id}]`, err)

  return [{ 'annId': id }]
}

async function doGet(url, options, count) {
  count = count || 0

  const res = await fetch(url, options)

  if (res.ok) {
    return res
  }

  if (count >= MAX_RETRIES) {
    throw new Error(res.statusText)
  }

  const attempt = count + 1
  const delay = RETRY_DELAY * (attempt)

  console.info(
    `[${TAG}] Delaying request by ${delay}ms due to error (attempt ${attempt})`,
    { status: res.status, statusText: res.statusText }
  )

  await Utils.delay(delay)()

  return doGet(url, options, count + 1)
}

const DATE_REGEX = /(\d{4})-?(\d{2})?-?(\d{2})?(?: to (\d{4})-?(\d{2})?-?(\d{2})?)?/

function processEntry(data) {
  const res = data['$']

  const info = ensureArray(data['info'])

  res['annId'] = res['id']
  res['Vintage'] = getXMLValue(ensureArray(data['info']), 'Vintage')

  if (res['Vintage'] && res['Vintage'].length) {
    const date = pickDate(res['Vintage'])

    if (date) {
      res['year'] = date['start']
      res['startYear'] = res['year']
      res['endYear'] = date['end']
    }
  }

  res['Genres'] = getXMLValue(info, 'Genres').map(cleanupGenre)
  res['Themes'] = getXMLValue(info, 'Themes').map(cleanupGenre)

  res['Episodes'] = getXMLValue(info, 'Number of episodes')
  res['Episodes'] = (res['Episodes'] && parseInt(res['Episodes'], 10)) || null

  const runtime = getXMLValue(info, 'Running time').pop() || null
  res['Runtime'] = parseInt(runtime, 10) || null

  // Try to guess runtime if missing
  res['Runtime'] = guessRuntime(res)

  if (data['related-prev']) {
    const relations = data['related-prev']
      .map(entry => entry['$'] && entry['$']['rel'] && entry['$']['rel'].toLowerCase())
      .filter(entry => !!entry)

    res['sequel'] = contains(relations, item => item.indexOf('sequel') !== -1)
    res['adaptation'] = contains(relations, item => item.indexOf('adapted') !== -1)
    res['spinOff'] = contains(relations, item => item.indexOf('spinoff') !== -1)
    res['compilation'] = contains(relations, item => item.indexOf('compilation') !== -1)
    res['sideStory'] = contains(relations, item => item.indexOf('side story') !== -1)
    res['remake'] = contains(relations, item => item.indexOf('remake') !== -1 || item.indexOf('alternate retelling') !== -1)

    // store to check if we missed something after a full run
    res['related-prev'] = data['related-prev'].map(entry => entry['$'] && entry['$']['rel'])
  }

  if (res['adaptation']) {
    res['sources'] = data['related-prev']
      .map(entry => entry['$'])
      .filter(entry => entry.rel && entry.rel.indexOf('adapted') !== -1)
      .map(entry => entry.id)
  }

  return res
}

function guessRuntime(res) {
  let runtime = res['Runtime']

  if (!runtime && res['type']) {
    const type = (res['type'] || '').toLowerCase()

    if (type === 'tv') {
      runtime = 25
    } else if (type === 'ona') {
      runtime = 15
    } else if (type === 'ova' || type === 'oav') {
      runtime = 30
    } else if (type === 'movie') {
      runtime = 60
    }
  }

  return runtime
}

function pickDate(vintage) {
  // TODO: we should be smarter when picking the date. Some shows have pre-air times, others have overseas dates
  return vintage
    .map(v => DATE_REGEX.exec(v))
    .map(date => ({
      start: (date[1] && parseInt(date[1], 10)) || null,
      end: (date[4] && parseInt(date[4], 10)) || null,
    }))
    .shift()
}

async function processRelations(entries) {
  const ids = entries
    .map(entry => entry.sources)
    .reduce((memo, sources) => memo.concat(sources || []), [])
    .filter((entry, idx, arr) => arr.indexOf(entry) === idx)

  if (ids.length === 0) {
    return entries
  }

  const pages = Math.ceil(ids.length / PAGE_SIZE)

  const p = []

  for (let i = 0; i < pages; i++) {
    const sub = ids.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE)

    p.push(
      fetchEntries(sub).then(
        raw => {
          const data = raw['ann'] || {}

          return Object.keys(data)
            .map(key => data[key] || [])
            .reduce((memo, entry) => memo.concat(entry), [])
            // We need to filter entries because sometimes an id is non-existing
            // despite the fact that it's listed as related
            .map(entry => entry['$'])
            .filter(entry => !!entry)
        },
        err => {
          console.warn(`[${TAG}] Error fetching related entry [${sub}]. \nError: ${err.message}`)
          return []
        },
      ),
    )
  }

  const data = await Promise.all(p)

  const map = data
    .reduce((memo, entry) => memo.concat(entry || []), [])
    .reduce((memo, data) => {
      memo[data['id']] = data['type'] || data['precision']
      return memo
    }, {})

  entries.forEach(entry => {
    if (entry.sources) {
      entry.sources = entry.sources
        .map(source => map[source] || 'unknown')
        .filter(entry => !!entry)
    }
  })

  return entries
}

function multiplyEntries(res) {
  // Multiple years, we need to split the episode count and generate entries for other years
  const startYear = res['year']
  const endYear = res['endYear']

  const type = (res['type'] || '').toLowerCase()
  const episodes = res['Episodes'] || 1

  // Duplicate if the show passed into the next year AND if it's not a TV show OR the episode count is larger than a full year
  if (startYear && endYear && startYear !== endYear && (type !== 'tv' || episodes > MAX_EPISODES_PER_YEAR)) {
    const output = []
    const yearCount = endYear - startYear
    const eps = episodes > 1 ? Math.floor(episodes / yearCount) : 1

    let i = 0
    for (let y = startYear; y <= endYear; y++) {
      const d = Object.assign({}, res)
      d['year'] = parseInt(y)
      d['Episodes'] = eps

      // Add the sequel tag to the duplicates
      if (i > 0) {
        d['sysGenerated'] = true
        d['sequel'] = true
      }

      d['totalEpisodes'] = episodes

      output.push(d)
      i++
    }

    return output
  } else {
    return res
  }
}

function buildId(entry) {
  let id

  if (isValidEntry(entry)) {
    const name = slugify(
      entry['name'],
      {
        lower: true,
        strict: true,
      },
    )

    id = `${entry['year']}/${name}`
  }

  entry['id'] = id

  return entry
}

function isValidEntry(entry) {
  const hasYear = !!entry['year']
  const hasGenres = entry['Genres'].length > 0
  const hasThemes = entry['Themes'] > 0

  return hasYear && (hasGenres || hasThemes)
}

function contains(arr, fn, ctx) {
  for (const k in arr) {
    // eslint-disable-next-line no-prototype-builtins
    if (arr.hasOwnProperty(k)) {
      if (fn.call(ctx || null, arr[k], k, arr)) {
        return true
      }
    }
  }

  return false
}

function getXMLValue(data, value) {
  return data
    .filter(i => i['$']['type'] === value)
    .map(d => d['_'])
    .filter(v => !!v)
}

const KNOWN_SYNONYMS = {
  'shonen': 'shounen',
  'bishojo': 'bishoujo',
  'bishonen': 'bishounen',
  'crossdressing': 'cross dressing',
  'fanservice': 'fan service',
  'immortality': 'immortal',
  'robots': 'robotics',
  'succubi': 'succubus',
  'terrorists': 'terrorism',
  'catgirls': 'cat girls',
  'superhero': 'super hero',
}

const synonyms = {}

function cleanupGenre(entry) {
  let res = slugify(
    entry,
    {
      replacement: ' ',
      lower: true,
      strict: true,
    },
  )

  res = res.toLowerCase().trim()

  if (KNOWN_SYNONYMS[res]) {
    return KNOWN_SYNONYMS[res]
  }

  if (synonyms[res]) {
    return synonyms[res]
  }

  if (res.charAt(res.length - 1) === 's') {
    synonyms[res] = res
    synonyms[res.substring(0, res.length - 1)] = res
  } else {
    synonyms[res + 's'] = res
    synonyms[res] = res
  }

  return res
}

function flatten(arr) {
  return ensureArray(arr)
    .reduce((memo, entry) => memo.concat(entry || []), [])
}

function ensureArray(arr) {
  return [].concat(arr || [])
}

module.exports = ANNReader
