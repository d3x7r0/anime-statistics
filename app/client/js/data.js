import DB from './db'
import { END_YEAR, START_YEAR } from './config'

let TOTALS, EPISODE_TOTALS

function fetchTotals () {
  return DB.fetchAllShows(START_YEAR, END_YEAR)
    .then(data => {
      TOTALS = data.rows.reduce((memo, entry) => {
        memo[entry.key] = entry.value
        return memo
      }, {})

      console.debug('Total show count', TOTALS)
    })
}

function fetchEpisodeTotals () {
  return DB.fetchEpisodeData(START_YEAR, END_YEAR)
    .then(data => {
      EPISODE_TOTALS = data.rows.reduce((memo, entry) => {
        const year = entry.key[0]
        const type = entry.key[1]

        memo[type] = memo[type] || {}
        memo[type][year] = Math.round(entry.value.sum / entry.value.count)

        return memo
      }, {})

      console.debug('Total episode averages', EPISODE_TOTALS)
    })
}

export function getTotals () {
  return TOTALS
}

export function getEpisodeTotals () {
  return EPISODE_TOTALS
}

export function init () {
  return Promise.all([
    fetchTotals(),
    fetchEpisodeTotals(),
  ])
}
