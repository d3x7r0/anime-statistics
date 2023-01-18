import { getEpisodeTotals, getStudioTotals } from '../js/data/studios'

export async function onBeforeRender() {
  const [
    totals,
    episodeTotals,
  ] = await Promise.all([
    getStudioTotals(),
    getEpisodeTotals()
  ])

  return {
    pageContext: {
      pageProps: {
        totals,
        episodeTotals,
      },
    },
  }
}
