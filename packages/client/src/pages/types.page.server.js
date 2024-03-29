import { h } from 'preact'

import { getTotals } from '../js/data/totals'
import { getTypeData } from '../js/data/types'

export async function onBeforeRender() {
  const [
    totals,
    types,
  ] = await Promise.all([
    getTotals(),
    getTypeData(),
  ])

  return {
    pageContext: {
      pageProps: {
        totals,
        types,
      },
    },
  }
}
