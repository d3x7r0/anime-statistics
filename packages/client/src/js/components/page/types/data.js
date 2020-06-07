import { buildEntry, reduceToActiveYears } from '../../../utils/entries'
import { generateColors } from '../../../utils/color'

function groupByYearAndType(entries = []) {
  return entries.reduce((memo, entry) => {
    const year = entry.key[1]
    const type = entry.key[0]

    memo[year] = memo[year] || {}
    memo[year][type] = entry.value

    return memo
  }, {})
}

export function processData(data) {
  const processed = reduceToActiveYears(
    groupByYearAndType(data),
  )

  const types = Object.keys(processed)
  const colors = generateColors(types.length, 'show-type-year-data')

  return types.map(
    (type, idx) => buildEntry({
      key: type,
      color: colors[idx],
    })(processed[type]),
  )
}
