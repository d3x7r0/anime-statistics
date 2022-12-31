export const START_YEAR = parseInt(import.meta.env.VITE_START_YEAR, 10)
export const END_YEAR = parseInt(import.meta.env.VITE_END_YEAR, 10)

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

const BASE_URL = (import.meta.env.VITE_BASE_URL || '').replace(/\/$/, "")

export const PATHS = {
  GENRE: cleanURL('/'),
  YEAR: cleanURL('/year'),
  TYPES: cleanURL('/types'),
}

function cleanURL(url = '') {
  return `${BASE_URL}${url}`
}

export const TITLE_SEPARATOR = ' :: '

// eslint-disable-next-line no-undef
export const BUILD_DATE = __BUILD_DATE__
