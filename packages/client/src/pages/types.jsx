/** @jsx h */
import { h } from 'preact'
import Head from 'next/head'

import { TITLES } from '../js/config'
import { buildTitle } from '../js/meta'
import { getTotals } from '../js/data/totals'
import { fetchTypes } from '../js/data/db/couch'
import Types from '../js/components/page/types'

export async function getStaticProps() {
  const [
    totals,
    types,
  ] = await Promise.all([
    getTotals(),
    fetchTypes(),
  ])

  return {
    // will be passed to the page component as props
    props: {
      totals,
      types,
    },
  }
}

export default function TypesPage(props) {
  return (
    <>
      <Head>
        <title key="title">{buildTitle(TITLES.TYPES)}</title>
      </Head>

      <Types {...props} />
    </>
  )
}
