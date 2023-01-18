import { getEpisodeTotals, getTotals } from '../js/data/totals'
import { getGenreData, getThemeData } from '../js/data/categories'
import { getTVEpisodeData } from '../js/data/averages'
import { getAggregatedData } from '../js/data/aggregated'

export async function onBeforeRender () {
  const [
    totals,
    episodeTotals,
    genres,
    themes,
    data,
    episodeData,
  ] = await Promise.all([
    getTotals(),
    getEpisodeTotals(),
    getGenreData(),
    getThemeData(),
    getAggregatedData(),
    getTVEpisodeData(),
  ])

  return {
    pageContext: {
      pageProps: {
        totals,
        episodeTotals,
        genres,
        themes,
        data,
        episodeData,
      }
    }
  }
}
