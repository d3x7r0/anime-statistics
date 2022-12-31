import fetch from 'isomorphic-fetch'

import { END_YEAR, START_YEAR } from '../../config'

async function fetchDB(design, view, startKey, endKey, opts = {}) {
  const parts = [
    `${process.env.COUCHDB_URL}/_design/${design}/_view/${view}?group=true`,
  ]

  if (startKey) {
    parts.push(`startkey=${encodeURIComponent(startKey)}`)
  }

  if (endKey) {
    parts.push(`endkey=${encodeURIComponent(endKey)}`)
  }

  parts.push(
    ...Object.entries(opts).map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`
    }),
  )

  const url = parts.join('&')

  console.debug('Fetching url: %s', url)

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(res.statusText)
  }

  const data = await res.json()

  return data.rows
}

function fetchArrayRange(design, view, start, end, opts = {}) {
  const a = JSON.stringify(start)
  const b = JSON.stringify(end || start)

  const arity = opts.arity || 2
  const inverted = opts.inverted === true

  let startKey
  let endKey

  if (inverted) {
    startKey = `[${Array.from({ length: arity - 1 })
      .map(() => '{}')
      .concat(a)
      .join(', ')}]`
  } else {
    startKey = `[${a}]`
  }

  if (inverted) {
    endKey = `[${b}]`
  } else {
    endKey = `[${b}, ${Array.from({ length: arity - 1 })
      .map(() => '{}')
      .join(', ')}]`
  }

  return fetchDB(design, view, startKey, endKey, inverted ? { descending: true } : undefined)
}

// curl "https://couchdb.local.nabais.me/ann/_design/aggregated/_view/all?group=true" > data/totals.json
export function fetchTotals() {
  return fetchDB('aggregated', 'all', START_YEAR, END_YEAR)
}

// curl "https://couchdb.local.nabais.me/ann/_design/aggregated/_view/episodesByType?group=true" > data/episode_totals.json
export function fetchEpisodeTotals() {
  return fetchArrayRange('aggregated', 'episodesByType', START_YEAR, END_YEAR)
}

// curl "https://couchdb.local.nabais.me/ann/_design/aggregated/_view/byKey?group=true" > data/data.json
export function fetchData() {
  return fetchArrayRange('aggregated', 'byKey', START_YEAR, END_YEAR, {
    inverted: true,
  })
}

// curl "https://couchdb.local.nabais.me/ann/_design/aggregated/_view/episodesByKeyAndType?group=true" > data/episode_data.json
export function fetchEpisodeData() {
  return fetchArrayRange('aggregated', 'episodesByKeyAndType', START_YEAR, END_YEAR, {
    arity: 3,
    inverted: true,
  })
}

// curl "https://couchdb.local.nabais.me/ann/_design/genres/_view/all?group=true" > data/genres.json
export function fetchGenres() {
  return fetchDB('genres', 'all')
}

// curl "https://couchdb.local.nabais.me/ann/_design/genres/_view/byYear?group=true" > data/data_genres.json
export function fetchDataGenres() {
  return fetchArrayRange('genres', 'byYear', START_YEAR, END_YEAR)
}

// curl "https://couchdb.local.nabais.me/ann/_design/themes/_view/all?group=true" > data/themes.json
export function fetchThemes() {
  return fetchDB('themes', 'all')
}

// curl "https://couchdb.local.nabais.me/ann/_design/themes/_view/byYear?group=true" > data/data_themes.json
export function fetchDataThemes() {
  return fetchArrayRange('themes', 'byYear', START_YEAR, END_YEAR)
}

// curl "https://couchdb.local.nabais.me/ann/_design/types/_view/byYear?group=true" > data/types.json
export function fetchTypes() {
  return fetchArrayRange('types', 'byYear', START_YEAR, END_YEAR)
}
