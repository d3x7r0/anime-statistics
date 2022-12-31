import { h } from 'preact'

import { getTotals } from '../js/data/totals'
import { fetchTypes } from '../js/data/db/couch'

export async function onBeforeRender() {
  const [
    totals,
    types,
  ] = await Promise.all([
    getTotals(),
    fetchTypes(),
  ])

  return {
    pageContext: {
      pageProps: {
        foo: 'bar',
        totals,
        types,
      },
    },
  }
}
