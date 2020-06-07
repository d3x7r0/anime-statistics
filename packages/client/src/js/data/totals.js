import { fetchEpisodeTotals, fetchTotals } from './db/couch'

export async function getTotals() {
  const data = await fetchTotals()

  return data.reduce((memo, entry) => ({
    ...memo,
    [entry.key]: entry.value,
  }), {})
}

export async function getEpisodeTotals() {
  const data = await fetchEpisodeTotals()

  return data
    .filter(entry => entry.key[1] === 'tv')
    .reduce((memo, entry) => ({
      ...memo,
      [entry.key[0]]: Math.round(entry.value.sum / entry.value.count),
    }), {})
}

