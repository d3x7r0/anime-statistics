import { buildLineChartOptions, buildRelativeLineChartOptions } from './shared'

export function buildTypesChartOptions(datasets) {
  const yAxis = {
    scaleLabel: {
      display: true,
      labelString: 'count',
    },
    ticks: {
      beginAtZero: true,
    },
  }

  return buildLineChartOptions(datasets, yAxis)
}

export function buildTypesRelativeChartOptions(datasets = [], totals = {}) {
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

  return buildRelativeLineChartOptions(datasets, totals, yAxis)
}
