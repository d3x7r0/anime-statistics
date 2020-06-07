import { MIN_SHOW_COUNT } from '../config'
import { generateColors } from '../utils/color'

import { fetchGenres, fetchThemes } from './db/couch'

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

export async function getGenreData() {
  return mapCategoryData(
    'genres',
    await fetchGenres(),
  )
}

export async function getThemeData() {
  return mapCategoryData(
    'themes',
    await fetchThemes(),
  )
}

