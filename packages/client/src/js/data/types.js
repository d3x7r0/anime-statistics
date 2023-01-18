import { END_YEAR, START_YEAR } from '../config'

import { fetchArrayRange } from './db/couch'

// curl "https://couchdb/ann/_design/types/_view/byYear?group=true"
export function getTypeData() {
  return fetchArrayRange('types', 'byYear', START_YEAR, END_YEAR)
}
