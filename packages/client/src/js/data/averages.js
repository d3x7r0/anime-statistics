import { END_YEAR, START_YEAR } from '../config'

import { fetchArrayRange } from './db/couch'

export async function getTVEpisodeData() {
  // curl "https://couchdb/ann/_design/aggregated/_view/episodesByKeyAndType?group=true"
  const entries = await fetchArrayRange('aggregated', 'episodesByKeyAndType', START_YEAR, END_YEAR, {
    arity: 3,
    inverted: true,
  })

  return entries.filter(entry => entry.key[1] === 'tv')
}
