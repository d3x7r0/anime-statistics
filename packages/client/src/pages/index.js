import { getEpisodeTotals, getTotals } from '../js/data/totals'
import { getGenreData, getThemeData } from '../js/data/categories'
import { fetchData } from '../js/data/db/couch'
import { getTVEpisodeData } from '../js/data/averages'
import GenrePage from '../js/components/page/genre'

export async function getStaticProps() {
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
    // will be passed to the page component as props
    props: {
      totals,
      episodeTotals,
      genres,
      themes,
      data,
      episodeData,
    },
  }
}

export default GenrePage
