import { getEpisodeTotals, getTotals } from '../js/data/totals'
import { getGenreData, getThemeData } from '../js/data/categories'
import { fetchData } from '../js/data/db/couch'
import { getTVEpisodeData } from '../js/data/averages'

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
    fetchData(),
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
