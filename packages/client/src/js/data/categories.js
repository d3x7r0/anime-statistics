import { END_YEAR, MIN_SHOW_COUNT, START_YEAR } from '../config'
import { generateColors } from '../utils/color'

import { fetchArrayRange, fetchDB } from './db/couch'

function mapCategoryData(type, data) {
  const entries = data.filter(d => d.value >= MIN_SHOW_COUNT)

  const colors = generateColors(entries.length, `genre-data-${type}`)

  return entries.map((entry, idx) => ({
    ...entry,
    label: entry.key,
    value: entry.key,
    color: colors[idx],
  }))
}

// Genres

// curl "https://couchdb/ann/_design/genres/_view/byYear?group=true"
export function getGenreYearData() {
  return fetchArrayRange('genres', 'byYear', START_YEAR, END_YEAR)
}

// curl "https://couchdb/ann/_design/genres/_view/all?group=true"
export async function getGenreData() {
  return mapCategoryData(
    'genres',
    await fetchDB('genres', 'all')
  )
}

// Themes

// curl "https://couchdb/ann/_design/themes/_view/byYear?group=true"
export function getThemesYearData() {
  return fetchArrayRange('themes', 'byYear', START_YEAR, END_YEAR)
}

// curl "https://couchdb/ann/_design/themes/_view/all?group=true"
export async function getThemeData() {
  return mapCategoryData(
    'themes',
    await fetchDB('themes', 'all'),
  )
}
