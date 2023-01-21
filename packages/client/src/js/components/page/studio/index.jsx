import { h } from 'preact'
import { useState, useMemo } from 'preact/hooks'

import { MAX_GENRE_ENTRIES, MAX_THEME_ENTRIES } from '../../../config'
import Chart from '../../atom/chart'
import TitledOrderedList from '../../atom/title-ordered-list'
import Select from '../../atom/select'

export default function Studio(props) {
  const {
    totals,
    episodeTotals,
  } = props

  const [studio, setStudio] = useState(totals[0].key)

  const studioData = totals.find(entry => entry.key === studio)

  const typesChartOptions = {}
  const topGenresChartOptions = {}
  const topThemesChartOptions = {}

  const genreDS = []
  const themeDS = []

  const studioTotals = useMemo(
    () => episodeTotals[studio] ?? {},
    [studio, episodeTotals],
  )

  const avgEpisodeCount = useMemo(() => {
    const entry = studioTotals?.tv

    if (!entry?.count) {
      return 'No Data'
    }

    return Math.round(entry.sum / entry.count)
  }, [studioTotals])

  return (
    <div className="charts pure-g">
      <form
        id="controls"
        className="pure-form pure-u-1"
        onSubmit={e => e.preventDefault()}
      >
        <Select
          name="studio"
          label="Studio"
          value={studio}
          onChange={(e) => setStudio(e.target.value)}
          entries={totals.map(entry => ({
            value: entry.key,
            label: `${entry.key} (${entry.value})`
          }))}
        />
      </form>

      <div className="year-details pure-u-1 pure-u-lg-1-2">
        <h2>Stats for &quot;{studio}&quot;:</h2>

        <ul id="yearDetails">
          <li><strong>Number of shows:</strong> {studioData?.value || 0}</li>
          <li><strong>Average Episode Count:</strong> {avgEpisodeCount}</li>

          { Object.entries(studioTotals).map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {value?.count}</li>
          )) }
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
