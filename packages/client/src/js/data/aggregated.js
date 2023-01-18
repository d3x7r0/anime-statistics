import { END_YEAR, START_YEAR } from '../config'

import { fetchArrayRange } from './db/couch'

// curl "https://couchdb/ann/_design/aggregated/_view/byKey?group=true&descending=true"
export function getAggregatedData() {
  return fetchArrayRange('aggregated', 'byKey', START_YEAR, END_YEAR, {
    inverted: true,
  })
}
