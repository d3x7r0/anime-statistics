import { fetchEpisodeData } from './db/couch'

export async function getTVEpisodeData() {
  const entries = await fetchEpisodeData()

  return entries.filter(entry => entry.key[1] === 'tv')
}
