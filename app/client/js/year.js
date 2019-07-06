import DB from './db'
import Chart from 'chart.js'
import { generateColors, lightenDarkenColor } from './utils/color'
import { END_YEAR, MAX_GENRE_ENTRIES, MAX_THEME_ENTRIES } from './config'
import { setupDownloads } from './dom/downloads'
import { printChart } from './dom/charts'
import { getEpisodeTotals, getTotals, init } from './data'

let $topGenresChart, $topThemesChart, $typesChart, $topGenres, $topThemes, $yearDetails
let $year

function onDatasetChange () {
  updateCharts()
}

function updateCharts () {
  const active = getActive()

  getData(
    'genres',
    active,
  ).then(ds => {
    console.debug(ds)

    printTop($topGenres, ds)
    drawTopGenreChart(ds)
  })

  getData(
    'themes',
    active,
  ).then(ds => {
    console.debug(ds)

    printTop($topThemes, ds)
    drawTopThemesChart(ds)
  })

  updateStats(active)

  getTypes(active).then(ds => {
    console.debug(ds)

    drawTypesChart(ds, parseInt(active.key, 10))
  })
}

function getActive () {
  const $el = $year.querySelectorAll(`[value="${$year.value}"]`)[0]

  if (!$el) {
    return
  }

  return ({
    key: $el.value,
  })
}

function getData (type, entry) {
  return DB.getYearData(type, entry.key)
    .then(processEntries(type + '-year-data'))
}

function getTypes (entry) {
  return DB.getTypes(entry.key)
    .then(processEntries('types-year-data'))
}

function processEntries (colorSeed) {
  return entries => {
    const rows = [].concat(entries.rows || [])

    const color = generateColors(rows.length, colorSeed)

    return rows
      .sort((a, b) => b.value - a.value)
      .map((entry, idx) => ({
        label: entry.key[1],
        value: entry.value,
        backgroundColor: color[idx],
        hoverBackgroundColor: lightenDarkenColor(color[idx], -35),
      }))
  }
}

function printTop ($target, dataset = []) {
  $target
    .querySelectorAll('.js-output')[0]
    .innerHTML = dataset.map(entry => `<li>${entry.label} - ${entry.value} shows</li>`).join('\n')
}

const CHARTS = {
  'topGenre': null,
  'topTheme': null,
  'types': null,
}

function drawTopGenreChart (dataset) {
  if (CHARTS['topGenre']) {
    CHARTS['topGenre'].destroy()
  }

  CHARTS['topGenre'] = drawChart(
    'pie',
    $topGenresChart,
    limit(dataset, MAX_GENRE_ENTRIES),
  )
}

function drawTopThemesChart (dataset) {
  if (CHARTS['topTheme']) {
    CHARTS['topTheme'].destroy()
  }

  CHARTS['topTheme'] = drawChart(
    'pie',
    $topThemesChart,
    dataset.slice(0, MAX_THEME_ENTRIES),
  )
}

function drawTypesChart (dataset = [], year) {
  if (CHARTS['types']) {
    CHARTS['types'].destroy()
  }

  dataset = dataset.map(entry => {
    const res = Object.assign({}, entry)
    let v = (entry.value / getTotals()[year] * 100)
    v = v.toFixed(2)
    res.value = parseInt(v, 10)
    return res
  })

  CHARTS['types'] = drawChart('horizontalBar', $typesChart, dataset, 'Types', {
    scales: {
      yAxes: [{
        stacked: true,
        scaleLabel: {
          display: true,
          labelString: 'percent',
        },
        ticks: {
          max: 100,
          beginAtZero: true,
        },
      }],
    },
  })
}

function drawChart (type, $target, dataset = [], label, options) {
  const $output = $target.querySelectorAll('.js-output')

  const data = dataset.reduce((memo, entry) => {
    memo.labels.push(entry.label)

    memo.datasets[0].data.push(entry.value)
    memo.datasets[0].backgroundColor.push(entry.backgroundColor)
    memo.datasets[0].hoverBackgroundColor.push(entry.hoverBackgroundColor)

    return memo
  }, {
    labels: [],
    datasets: [{
      label: label,
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: [],
    }],
  })

  return new Chart($output, {
    type: type,
    data: data,
    options: options,
  })
}

function limit (dataset = [], limit) {
  const data = dataset.slice(0, limit)

  const rest = dataset.slice(limit).reduce((memo, entry) => ({
    label: 'Others',
    value: memo.value + entry.value,
    backgroundColor: memo.backgroundColor || entry.backgroundColor,
    hoverBackgroundColor: memo.hoverBackgroundColor || entry.hoverBackgroundColor,
  }), {
    value: 0,
  })

  data.push(rest)

  return data
}

function updateStats (entry) {
  const year = entry.key

  const totals = getTotals()
  const episodeTotals = getEpisodeTotals()['tv']

  $yearDetails.innerHTML = `<li><strong>Number of shows:</strong> ${totals[year]}</li>` +
    `<li><strong>Average Episode Count:</strong> ${episodeTotals[year]}</li>`
}

function printOption (key) {
  return `<option value="${key}">${key}</option>`
}

function enableForm () {
  setupDownloads()

  $year.innerHTML = Object.keys(getTotals())
    .map(printOption)
    .join('\n')
  $year.value = END_YEAR
  $year.removeAttribute('disabled')

  updateCharts()
}

function run () {
  $topGenresChart = printChart('topGenresChart', `Top ${MAX_GENRE_ENTRIES} Genres`)
  $topThemesChart = printChart('topThemesChart', `Top ${MAX_THEME_ENTRIES} Themes`)
  $typesChart = printChart('typesChart', 'Type of shows (%)')

  $topGenres = document.getElementById('topGenres')
  $topThemes = document.getElementById('topThemes')
  $yearDetails = document.getElementById('yearDetails')

  $year = document.getElementById('year')

  $year.addEventListener('change', onDatasetChange)

  init().then(enableForm)
}

run()
