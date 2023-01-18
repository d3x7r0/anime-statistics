import { getEpisodeTotals, getTotals } from '../js/data/totals'
import { getTypeData } from '../js/data/types'
import { getGenreYearData, getThemesYearData } from '../js/data/categories'

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
    getTypeData(),
    getGenreYearData(),
    getThemesYearData(),
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
