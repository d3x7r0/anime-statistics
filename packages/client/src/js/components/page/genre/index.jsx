import { h } from 'preact'
import { useCallback, useMemo, useState } from 'preact/hooks'
import { uniq, without } from 'lodash'

import { MAX_GENRE_ENTRIES } from '../../../config'
import Chart from '../../atom/chart'
import CategoryList from '../../molecules/category-list'
import {
  buildAbsoluteChartOptions,
  buildCumulativeRelativeChartOptions,
  buildEpisodesChartOptions,
  buildRelativeChartOptions,
} from '../../../charts/home'

import { buildDataDataset, buildEpisodeDataset, calculateTotals, getTop } from './data'

function GenrePage(props) {
  const {
    totals,
    episodeTotals,
    genres = [],
    themes = [],
    data,
    episodeData,
  } = props

  const totalsPerType = useMemo(() => calculateTotals(data), [data])

  const [activeGenres, setActiveGenres] = useState(() => getTop(totalsPerType, MAX_GENRE_ENTRIES, genres))
  const [activeThemes, setActiveThemes] = useState([])

  const onGenreChange = useCallback((genre, selected) => {
    setActiveGenres(
      activeGenres => selected ?
        uniq(activeGenres.concat(genre)) :
        without(activeGenres, genre),
    )
  }, [setActiveGenres])

  const onThemeChange = useCallback((genre, selected) => {
    setActiveThemes(
      activeGenres => selected ?
        uniq(activeGenres.concat(genre)) :
        without(activeGenres, genre),
    )
  }, [setActiveThemes])

  const onGenreToggle = useCallback(
    () => setActiveGenres(
      active => active.length === genres.length ? [] : genres.map(e => e.value),
    ),
    [setActiveGenres, genres],
  )

  const onThemeToggle = useCallback(
    () => setActiveThemes(
      active => active.length === themes.length ? [] : themes.map(e => e.value),
    ),
    [setActiveThemes, themes],
  )

  const themeMap = useMemo(
    () => themes.reduce((memo, entry) => ({
      ...memo,
      [entry.key]: entry,
    }), {}),
    [themes],
  )

  const genreMap = useMemo(
    () => genres.reduce((memo, entry) => ({
      ...memo,
      [entry.key]: entry,
    }), {}),
    [genres],
  )

  const active = useMemo(
    () => activeGenres.map(key => genreMap[key])
      .concat(activeThemes.map(key => themeMap[key])),
    [activeGenres, activeThemes, genreMap, themeMap],
  )

  const activeDataDS = useMemo(
    () => buildDataDataset(data, active),
    [data, active],
  )

  const activeEpisodeDataDS = useMemo(
    () => buildEpisodeDataset(episodeData, active),
    [episodeData, active],
  )

  const relativeChartOptions = useMemo(
    () => buildRelativeChartOptions(activeDataDS, totals),
    [activeDataDS, totals],
  )

  const relativeCumulativeChartOptions = useMemo(
    () => buildCumulativeRelativeChartOptions(activeDataDS, totals),
    [activeDataDS, totals],
  )

  const absoluteChartOptions = useMemo(
    () => buildAbsoluteChartOptions(activeDataDS, totals),
    [activeDataDS, totals],
  )

  const episodeChartOptions = useMemo(
    () => buildEpisodesChartOptions(activeEpisodeDataDS, episodeTotals),
    [activeEpisodeDataDS, episodeTotals],
  )

  return (
    <>
      <div className="charts pure-g">
        <Chart
          className="chart pure-u-1 pure-u-lg-1-2"
          downloadable
          id="relative"
          title='% of shows per year'
          options={relativeChartOptions}
        />

        <Chart
          className="chart pure-u-1 pure-u-lg-1-2"
          downloadable
          id="relative-cumulative"
          title='% of shows per year (cumulative)'
          options={relativeCumulativeChartOptions}
        />

        <Chart
          className="chart pure-u-1 pure-u-lg-1-2"
          downloadable
          id="absolute"
          title='# of shows per year'
          options={absoluteChartOptions}
        />

        <Chart
          className="chart pure-u-1 pure-u-lg-1-2"
          downloadable
          id="episodes"
          title='Avg. # of Eps per year (TV)'
          options={episodeChartOptions}
        />
      </div>

      <form id="controls" className="pure-form pure-g">
        <div className="form-select pure-u-1 pure-u-md-1-2">
          <CategoryList
            label="Genres"
            entries={prepareEntries(genres, totalsPerType)}
            selected={activeGenres}
            onChange={onGenreChange}
            onToggleAll={onGenreToggle}
          />
        </div>

        <div className="form-select pure-u-1 pure-u-md-1-2">
          <CategoryList
            label="Themes"
            entries={prepareEntries(themes, totalsPerType)}
            selected={activeThemes}
            onChange={onThemeChange}
            onToggleAll={onThemeToggle}
          />
        </div>
      </form>
    </>
  )
}

function prepareEntries(entries = [], totals = {}) {
  return entries
    .map(entry => ({
      ...entry,
      label: buildLabel(entry, totals),
    }))
    .sort((a, b) => totals[b.key] - totals[a.key])
}

function buildLabel(theme, totalsPerType) {
  return `${theme.label} (${totalsPerType[theme.key]} Shows)`
}

export default GenrePage
