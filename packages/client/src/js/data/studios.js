import { END_YEAR, START_YEAR } from '../config'

import { fetchArrayRange, fetchDB } from './db/couch'

export function getStudioTotals() {
  // curl "https://couchdb/ann/_design/studios/_view/all?group=true"
  return fetchDB('studios', 'all')
}

export async function getEpisodeTotals() {
  // curl "https://couchdb/ann/_design/studios/_view/episodesByKeyAndType?group=true"
  const data = await fetchArrayRange('studios', 'episodesByKeyAndType', START_YEAR, END_YEAR, {
    inverted: true,
  })

  return data.reduce((memo, entry) => {
    const [studio, type] = entry.key

    memo[studio] = memo[studio] ?? {}

    memo[studio][type] = {
      sum: (memo[studio][type]?.sum ?? 0) + entry.value.sum,
      count: (memo[studio][type]?.count ?? 0) + entry.value.count,
    }

    return memo
  }, {})
}

