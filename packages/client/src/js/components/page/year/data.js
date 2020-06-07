import { generateColors, lightenDarkenColor } from '../../../utils/color'

function processEntries(entries = [], colorSeed) {
  const color = generateColors(entries.length, colorSeed)

  return entries
    .sort((a, b) => b.value - a.value)
    .map((entry, idx) => ({
      label: entry.key[1],
      value: entry.value,
      backgroundColor: color[idx],
      hoverBackgroundColor: lightenDarkenColor(color[idx], -35),
    }))
}

function filterByYear(entries = [], year) {
  return entries.filter(item => item.key && item.key[0] === year)
}

export function processData(type, entries, year) {
  const seed = `${type}-year-data`

  return processEntries(
    filterByYear(entries, year),
    seed,
  )
}

const TYPES_SEED = 'types-year-data'

export function processTypesData(entries, year) {
  return processEntries(
    filterByYear(entries, year),
    TYPES_SEED,
  )
}
