import { buildEntry, mapToActiveYears } from '../../../utils/entries'

function filterData(rows = [], keys = []) {
  return rows.filter(entry => keys.includes(entry.key[0]))
}

function groupData(rows = []) {
  return rows.reduce((memo, entry) => {
    const key = entry.key[0]

    memo[key] = memo[key] || []
    memo[key].push(entry)
    memo[key].sort((a, b) => a.key[1] - b.key[1])

    return memo
  }, {})
}

function processEntries(entries = []) {
  const data = entries.reduce((memo, entry) => {
    const key = entry.key[1]
    memo[key] = entry.value
    return memo
  }, {})

  return mapToActiveYears(data)
}

function processEpisodeEntries(entries = []) {
  const data = entries
    .filter(entry => entry.key[1] === 'tv')
    .reduce((memo, entry) => ({
      ...memo,
      [entry.key[2]]: entry.value,
    }), {})

  return mapToActiveYears(data)
}

function calculateAverages(data) {
  return data.map(value => Math.round(value['sum'] / value['count'] || 0))
}

export function calculateTotals(data = []) {
  const processedData = groupData(data)

  return Object.fromEntries(
    Object.entries(processedData).map(
      ([key, values]) => [
        key,
        values.reduce((memo, entry) => memo + entry.value, 0),
      ],
    ),
  )
}

export function getTop(totals = {}, count, types = []) {
  const keys = types.map(entry => entry.key)

  return Object.entries(totals)
    .filter(entry => keys.includes(entry[0]))
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, count)
}

export function buildDataDataset(data = [], types = []) {
  const processedData = groupData(
    filterData(data, types.map(entry => entry.key)),
  )

  return types.map(
    entry => buildEntry(entry)(
      processEntries(processedData[entry.key]),
    ),
  )
}

export function buildEpisodeDataset(data = [], types = []) {
  const processedData = groupData(
    filterData(data, types.map(entry => entry.key)),
  )

  return types.map(
    entry => buildEntry(entry)(
      calculateAverages(
        processEpisodeEntries(processedData[entry.key]),
      ),
    ),
  )
}
