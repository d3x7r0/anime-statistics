import { lightenDarkenColor } from './color'
import { ACTIVE_YEARS } from '../config'

export function reduceToActiveYears (data) {
  return Object.keys(data).reduce((memo, key) => {
    memo[key] = mapToActiveYears(data[key])
    return memo
  }, {})
}

export function mapToActiveYears (data) {
  return ACTIVE_YEARS.reduce((memo, label, idx) => {
    memo[idx] = data[label] || 0
    return memo
  }, [])
}

export function buildEntry (entry) {
  return data => ({
    label: entry.key,
    data: data,
    fill: false,
    backgroundColor: entry.color,
    borderColor: lightenDarkenColor(entry.color, -35),
  })
}
