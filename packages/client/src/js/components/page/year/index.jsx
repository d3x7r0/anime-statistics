/** @jsx h */
import { h } from 'preact'
import { useMemo, useState } from 'preact/hooks'

import { ACTIVE_YEARS, MAX_GENRE_ENTRIES, MAX_THEME_ENTRIES } from '../../../config'
import Select from '../../atom/select'
import Chart from '../../atom/chart'
import TitledOrderedList from '../../atom/title-ordered-list'
import {
  buildTopGenresChartOptions,
  buildTopThemesChartOptions,
  buildTypesChartOptions,
} from '../../../charts/year'

import { processData, processTypesData } from './data'

export default function Types(props) {
  const {
    totals,
    episodeTotals,
    types,
    genres,
    themes,
  } = props

  const [year, setYear] = useState(ACTIVE_YEARS[ACTIVE_YEARS.length - 1])

  const genreDS = useMemo(
    () => processData('genres', genres, year),
    [genres, year],
  )

  const themeDS = useMemo(
    () => processData('themes', themes, year),
    [themes, year],
  )

  const typesDS = useMemo(
    () => processTypesData(types, year),
    [types, year],
  )

  const topGenresChartOptions = useMemo(
    () => buildTopGenresChartOptions(genreDS),
    [genreDS],
  )

  const topThemesChartOptions = useMemo(
    () => buildTopThemesChartOptions(themeDS),
    [themeDS],
  )

  const typesChartOptions = useMemo(
    () => buildTypesChartOptions(typesDS, totals, year),
    [typesDS, totals, year],
  )

  return (
    <div className="charts pure-g">
      <form id="controls" className="pure-form pure-u-1">
        <Select
          name="year"
          label="Year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          entries={
            ACTIVE_YEARS.map(year => ({
              value: year,
              label: year,
            }))
          }
        />
      </form>

      <div className="year-details pure-u-1 pure-u-lg-1-2">
        <h2>Year stats:</h2>

        <ul id="yearDetails">
          <li><strong>Number of shows:</strong> {totals[year]}</li>
          <li><strong>Average Episode Count:</strong> {episodeTotals[year]}</li>
        </ul>
      </div>

      <Chart
        className="chart pure-u-1 pure-u-lg-1-2"
        id="typesChart"
        downloadable
        title="Type of shows (%)"
        options={typesChartOptions}
      />

      <Chart
        className="chart pure-u-1 pure-u-lg-1-2"
        id="topGenresChart"
        downloadable
        title={`Top ${MAX_GENRE_ENTRIES} Genres`}
        options={topGenresChartOptions}
      />

      <Chart
        className="chart pure-u-1 pure-u-lg-1-2"
        id="topThemesChart"
        title={`Top ${MAX_THEME_ENTRIES} Themes`}
        downloadable
        options={topThemesChartOptions}
      />

      <TitledOrderedList
        title="Top Genres"
        className="top pure-u-1 pure-u-lg-1-2"
        id="topGenres"
        entries={genreDS}
      />

      <TitledOrderedList
        title="Top Themes"
        className="top pure-u-1 pure-u-lg-1-2"
        id="topThemes"
        entries={themeDS}
      />
    </div>
  )
}
