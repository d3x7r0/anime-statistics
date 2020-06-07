export const START_YEAR = parseInt(process.env.NEXT_PUBLIC_START_YEAR, 10)
export const END_YEAR = parseInt(process.env.NEXT_PUBLIC_END_YEAR, 10)

export const ACTIVE_YEARS = Array.from(
  { length: END_YEAR - START_YEAR + 1 },
  (x, i) => START_YEAR + i,
)

export const MAX_GENRE_ENTRIES = 10
export const MAX_THEME_ENTRIES = 20

export const MIN_SHOW_COUNT = 25

export const TITLES = {
  SITE: 'ANN Encyclopedia Statistics',
  GENRE: 'Genre',
  YEAR: 'Year',
  TYPES: 'Types',
}

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, "")

export const PATHS = {
  GENRE: cleanURL('/'),
  YEAR: cleanURL('/year'),
  TYPES: cleanURL('/types'),
}

function cleanURL(url = '') {
  console.debug(BASE_URL)
  return `${BASE_URL}${url}`
}

export const TITLE_SEPARATOR = ' :: '
