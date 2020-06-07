/** @jsx h */
import { h } from 'preact'
import { useMemo } from 'preact/hooks'

import { buildTypesChartOptions, buildTypesRelativeChartOptions } from '../../../charts/types'
import Chart from '../../atom/chart'

import { processData } from './data'

export default function Types(props) {
  const {
    totals,
    types,
  } = props

  const ds = useMemo(
    () => processData(types, totals),
    [types, totals],
  )

  const typesChartOptions = useMemo(
    () => buildTypesChartOptions(ds),
    [ds],
  )

  const typesRelativeChartOptions = useMemo(
    () => buildTypesRelativeChartOptions(ds, totals),
    [ds, totals],
  )

  return (
    <div className="charts pure-g">
      <Chart
        className="chart pure-u-1 pure-u-lg-1-2"
        downloadable
        id="types"
        title="Types of shows per year"
        options={typesChartOptions}
      />

      <Chart
        className="chart pure-u-1 pure-u-lg-1-2"
        downloadable
        id="typesRelative"
        title="Types of shows per year (%)"
        options={typesRelativeChartOptions}
      />
    </div>
  )
}
