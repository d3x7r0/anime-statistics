import { MAX_GENRE_ENTRIES, MAX_THEME_ENTRIES } from '../config'

export function buildTopGenresChartOptions(dataset) {
  return buildPieChartOptions(dataset, MAX_GENRE_ENTRIES)
}

export function buildTopThemesChartOptions(dataset) {
  return buildPieChartOptions(dataset, MAX_THEME_ENTRIES)
}

export function buildPieChartOptions(dataset = [], entryCount) {
  return buildChartOptions(
    'pie',
    dataset.slice(0, entryCount),
  )
}

export function buildTypesChartOptions(dataset = [], totals, year) {
  dataset = dataset.map(entry => ({
    ...entry,
    value: parseInt((entry.value / totals[year] * 100).toFixed(2), 10),
  }))

  return buildChartOptions('horizontalBar', dataset, 'Types', {
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

function buildChartOptions(type, dataset = [], label, options) {
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

  return {
    type: type,
    data: data,
    options: options,
  }
}
