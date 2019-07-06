import DB from './db'
import { generateColors } from './utils/color'
import { END_YEAR, START_YEAR } from './config'
import { buildEntry, reduceToActiveYears } from './utils/entries'
import { setupDownloads } from './dom/downloads'
import { drawLineChart, printChart } from './dom/charts'
import { getTotals, init } from './data'

let $types, $typesRelative

function populateTypes () {
  return getTypesData().then(ds => {
    console.debug('Episode Count per Genre Data', ds)

    drawTypesChart(ds)
    drawTypesRelativeChart(ds)
  })
}

function getTypesData () {
  return DB.getTypesData(START_YEAR, END_YEAR)
    .then(data => processTypes(data && data.rows))
    .then(data => {
      const types = Object.keys(data)

      const colors = generateColors(types.length, 'show-type-year-data')

      return types.map((type, idx) => {
        const fn = buildEntry({
          key: type,
          color: colors[idx],
        })

        return fn(data[type])
      })
    })
}

function processTypes (entries) {
  const data = [].concat(entries || [])
    .reduce((memo, entry) => {
      const year = entry.key[1]
      const type = entry.key[0]

      memo[year] = memo[year] || {}
      memo[year][type] = entry.value

      return memo
    }, {})

  return reduceToActiveYears(data)
}

const CHARTS = {
  'types': null,
  'types-relative': null,
}

function drawTypesChart (datasets) {
  if (CHARTS['types']) {
    CHARTS['types'].destroy()
  }

  const yAxis = {
    scaleLabel: {
      display: true,
      labelString: 'count',
    },
    ticks: {
      beginAtZero: true,
    },
  }

  CHARTS['types'] = drawLineChart($types, datasets, yAxis)
}

function drawTypesRelativeChart (datasets = []) {
  if (CHARTS['types-relative']) {
    CHARTS['types-relative'].destroy()
  }

  const yAxis = {
    stacked: true,
    scaleLabel: {
      display: true,
      labelString: 'percent',
    },
    ticks: {
      max: 100,
      steps: 20,
      beginAtZero: true,
    },
  }

  let totals = getTotals()

  const ds = datasets.map(ds => {
    const years = Object.keys(totals)
    const res = Object.assign({}, ds)

    res.fill = true

    res.data = res.data.map((value, idx) => {
      const year = years[idx]
      let v = (value / totals[year] * 100)
      v = v.toFixed(2)
      return parseInt(v, 10)
    })

    return res
  })

  CHARTS['types-relative'] = drawLineChart($typesRelative, ds, yAxis)
}

function enableForm () {
  setupDownloads()

  populateTypes()
}

function run () {
  $types = printChart('types', 'Types of shows per year')
  $typesRelative = printChart('typesRelative', 'Types of shows per year (%)')

  init().then(enableForm)
}

run()
