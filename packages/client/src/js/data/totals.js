import { END_YEAR, START_YEAR } from '../config'

import { fetchArrayRange, fetchDB } from './db/couch'

export async function getTotals() {
  // curl "https://couchdb/ann/_design/aggregated/_view/all?group=true"
  const data = await fetchDB('aggregated', 'all', START_YEAR, END_YEAR)

  return data.reduce((memo, entry) => ({
    ...memo,
    [entry.key]: entry.value,
  }), {})
}

export async function getEpisodeTotals() {
  // curl "https://couchdb/ann/_design/aggregated/_view/episodesByType?group=true"
  const data = await fetchArrayRange('aggregated', 'episodesByType', START_YEAR, END_YEAR)

  return data
    .filter(entry => entry.key[1] === 'tv')
    .reduce((memo, entry) => ({
      ...memo,
      [entry.key[0]]: Math.round(entry.value.sum / entry.value.count),
    }), {})
}

