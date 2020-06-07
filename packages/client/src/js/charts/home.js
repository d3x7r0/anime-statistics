import { buildLineChartOptions, buildRelativeLineChartOptions } from './shared'

export function buildAbsoluteChartOptions(datasets = [], totals) {
  const yAxis = {
    scaleLabel: {
      display: true,
      labelString: 'count',
    },
    ticks: {
      beginAtZero: true,
    },
  }

  const ds = [{
    label: 'total',
    data: Object.keys(totals).map(y => totals[y]),
    fill: false,
  }].concat(datasets)

  return buildLineChartOptions(ds, yAxis)
}

export function buildRelativeChartOptions(datasets = [], totals) {
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

  return buildLineChartOptions(ds, yAxis)
}

export function buildCumulativeRelativeChartOptions(datasets = [], totals) {
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

  return buildRelativeLineChartOptions(datasets, totals, yAxis)
}

export function buildEpisodesChartOptions(datasets = [], totals) {
  const yAxis = {
    scaleLabel: {
      display: true,
      labelString: 'avg. episode count',
    },
    ticks: {
      beginAtZero: true,
    },
  }

  const ds = [{
    label: 'overall',
    data: Object.keys(totals).map(y => totals[y]),
    fill: false,
  }].concat(datasets)

  return buildLineChartOptions(ds, yAxis)
}
