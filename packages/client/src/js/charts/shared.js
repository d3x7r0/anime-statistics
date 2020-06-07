import { ACTIVE_YEARS } from '../config'

export function buildRelativeLineChartOptions(datasets, totals, yAxis) {
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

  return buildLineChartOptions(ds, yAxis)
}

export function buildLineChartOptions(ds, yAxis) {
  return {
    type: 'line',
    data: {
      labels: ACTIVE_YEARS,
      datasets: ds.slice(0),
    },
    options: {
      tooltips: {
        mode: 'label',
      },
      hover: {
        mode: 'label',
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'year',
          },
        }],
        yAxes: [yAxis],
      },
    },
  }
}
