export const START_YEAR = parseInt(process.env.START_YEAR, 10)
export const END_YEAR = parseInt(process.env.END_YEAR, 10)

export const ACTIVE_YEARS = Array.from(
  { length: END_YEAR - START_YEAR + 1 },
  (x, i) => START_YEAR + i,
)

export const MAX_GENRE_ENTRIES = 10
export const MAX_THEME_ENTRIES = 20

export const MIN_SHOW_COUNT = 25
