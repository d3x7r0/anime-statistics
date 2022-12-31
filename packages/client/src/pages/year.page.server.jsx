import { h } from 'preact'

import { getEpisodeTotals, getTotals } from '../js/data/totals'
import { fetchDataGenres, fetchDataThemes, fetchTypes } from '../js/data/db/couch'

export async function onBeforeRender() {
  const [
    totals,
    episodeTotals,
    types,
    genres,
    themes,
  ] = await Promise.all([
    getTotals(),
    getEpisodeTotals(),
    fetchTypes(),
    fetchDataGenres(),
    fetchDataThemes(),
  ])

  return {
    pageContext: {
      pageProps: {
        totals,
        episodeTotals,
        types,
        genres,
        themes,
      },
    },
  }
}
