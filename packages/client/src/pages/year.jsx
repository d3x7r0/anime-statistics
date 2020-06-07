/** @jsx h */
import { h } from 'preact'
import Head from 'next/head'

import { TITLES } from '../js/config'
import { buildTitle } from '../js/meta'
import { getEpisodeTotals, getTotals } from '../js/data/totals'
import { fetchDataGenres, fetchDataThemes, fetchTypes } from '../js/data/db/couch'
import Year from '../js/components/page/year'

export async function getStaticProps() {
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
    // will be passed to the page component as props
    props: {
      totals,
      episodeTotals,
      types,
      genres,
      themes,
    },
  }
}

export default function TypesPage(props) {
  return (
    <>
      <Head>
        <title key="title">{buildTitle(TITLES.YEAR)}</title>
      </Head>

      <Year {...props} />
    </>
  )
}
