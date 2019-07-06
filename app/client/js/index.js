import DB from './db'
import { generateColors } from './utils/color'
import { MIN_SHOW_COUNT } from './config'
import { buildEntry, mapToActiveYears, reduceToActiveYears } from './utils/entries'
import { setupDownloads } from './dom/downloads'
import { drawLineChart, printChart } from './dom/charts'
import { getEpisodeTotals, getTotals, init } from './data'

let $absolute, $relative, $relativeCumulative, $episodes
let $genres, $themes

function onDatasetChange () {
  updateCharts()
}

function updateCharts () {
  const values = getActive()

  Promise.all(
    values.map(getData),
  ).then(ds => {
    console.debug('Genre data', ds)

    drawAbsoluteChart(ds)
    drawRelativeChart(ds)
    drawCumulativeRelativeChart(ds)
  })

  Promise.all(
    values.map(getEpisodeData),
  ).then(ds => {
    console.debug('Episode Count per Genre Data', ds)

    drawEpisodesChart(ds)
  })
}

function getActive () {
  let $g = $genres.querySelectorAll(':checked')
  let $t = $themes.querySelectorAll(':checked')

  $g = Array.prototype.slice.call($g)
  $t = Array.prototype.slice.call($t)

  return $g.concat($t).map($el => ({
    key: $el.value,
    color: $el.dataset.color,
  }))
}

function getData (entry) {
  return DB.getData(entry.key)
    .then(data => processEntries(data && data.rows))
    .then(buildEntry(entry))
}

function getEpisodeData (entry) {
  return DB.getEpisodeData(entry.key)
    .then(data => processEpisodeEntries(data && data.rows))
    .then(calculateEpisodeAverages)
    .then(data => Object.keys(data).reduce((memo, key) => {
      memo[key] = buildEntry(entry)(data[key])
      return memo
    }, {}))
}

function processEntries (entries) {
  const data = [].concat(entries || [])
    .reduce((memo, entry) => {
      const key = entry.key[1]
      memo[key] = entry.value
      return memo
    }, {})

  return mapToActiveYears(data)
}

function processEpisodeEntries (entries) {
  const data = [].concat(entries || [])
    .reduce((memo, entry) => {
      const year = entry.key[2]
      const type = entry.key[1]

      memo[type] = memo[type] || {}
      memo[type][year] = entry.value

      return memo
    }, {})

  return reduceToActiveYears(data)
}

function calculateEpisodeAverages (data) {
  return Object.keys(data).reduce((memo, key) => {
    memo[key] = calculateAverages(data[key] || [])
    return memo
  }, {})
}

function calculateAverages (data) {
  return data.map(value => Math.round(value['sum'] / value['count'] || 0))
}

const CHARTS = {
  'absolute': null,
  'relative': null,
  'relative-cumulative': null,
  'episodes': null,
}

function drawAbsoluteChart (datasets = []) {
  if (CHARTS['absolute']) {
    CHARTS['absolute'].destroy()
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

  const totals = getTotals()

  const ds = [{
    label: 'total',
    data: Object.keys(totals).map(y => totals[y]),
    fill: false,
  }].concat(datasets)

  CHARTS['absolute'] = drawLineChart($absolute, ds, yAxis)
}

function drawRelativeChart (datasets = []) {
  if (CHARTS['relative']) {
    CHARTS['relative'].destroy()
  }

  const yAxis = {
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

  const totals = getTotals()

  const ds = datasets.map(ds => {
    const years = Object.keys(totals)
    const res = Object.assign({}, ds)

    res.data = res.data.map((value, idx) => {
      const year = years[idx]
      let v = (value / totals[year] * 100)
      v = v.toFixed(2)
      return parseInt(v, 10)
    })

    return res
  })

  CHARTS['relative'] = drawLineChart($relative, ds, yAxis)
}

function drawCumulativeRelativeChart (datasets = []) {
  if (CHARTS['relative-cumulative']) {
    CHARTS['relative-cumulative'].destroy()
  }

  const yAxis = {
    stacked: true,
    scaleLabel: {
      display: true,
      labelString: 'percent',
    },
    ticks: {
      beginAtZero: true,
    },
  }

  const totals = getTotals()

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

  CHARTS['relative-cumulative'] = drawLineChart($relativeCumulative, ds, yAxis)
}

function drawEpisodesChart (datasets = []) {
  if (CHARTS['episodes']) {
    CHARTS['episodes'].destroy()
  }

  const yAxis = {
    scaleLabel: {
      display: true,
      labelString: 'avg. episode count',
    },
    ticks: {
      beginAtZero: true,
    },
  }

  const totals = getEpisodeTotals()['tv']

  const ds = [{
    label: 'overall',
    data: Object.keys(totals).map(y => totals[y]),
    fill: false,
  }].concat(datasets.map(ds => ds['tv']))

  CHARTS['episodes'] = drawLineChart($episodes, ds, yAxis)
}

function populateAll (type, $target) {
  return DB.getGenreData(type)
    .then(function (data) {
      let entries = data.rows.filter(d => d.value >= MIN_SHOW_COUNT)

      const colors = generateColors(entries.length, 'genre-data-' + type)

      entries = entries.map((entry, idx) => {
        entry.color = colors[idx]
        return entry
      })

      $target.querySelectorAll('.js-values')[0].innerHTML = entries.map(printOption).join('\n')
    })
}

function printOption (entry) {
  return `<label for="entry_${entry.key}" class="pure-checkbox"><input type="checkbox" value="${entry.key}" data-color="${entry.color}" id="entry_${entry.key}" />${entry.key}</label>`
}

function enableForm () {
  setupDownloads()

  $genres.removeAttribute('disabled')
  $themes.removeAttribute('disabled')

  updateCharts()
}

function run () {
  $absolute = printChart('absolute', '# of shows per year')
  $relative = printChart('relative', '% of shows per year')
  $relativeCumulative = printChart('relative-cumulative', '% of shows per year (cumulative)')
  $episodes = printChart('episodes', 'Avg. # of Eps per year (TV)')

  $genres = document.getElementById('genres')
  $themes = document.getElementById('themes')

  $genres.addEventListener('change', onDatasetChange)
  $themes.addEventListener('change', onDatasetChange)

  Promise.all([
    init(),
    populateAll('genres', $genres),
    populateAll('themes', $themes),
  ]).then(enableForm)
}

run()
