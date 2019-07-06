function fetchDB (design, view, startKey, endKey) {
  const parts = [
    `${process.env.DB_LOCATION}/_design/${design}/_view/${view}?group=true`,
  ]

  if (startKey) {
    parts.push(`startkey=${startKey}`)
  }

  if (endKey) {
    parts.push(`endkey=${endKey}`)
  }

  const url = parts.join('&')

  console.debug('Fetching url: %s', url)

  return fetch(url).then(res => res.json())
}

function fetchRange (design, view, start, end) {
  const a = JSON.stringify(start)
  const b = JSON.stringify(end || start)

  return fetchDB(design, view, `[${a}]`, `[${b}, {}]`)
}

function fetchAllShows (start, end) {
  console.debug('Fetching all shows', start, end)

  return fetchDB('aggregated', 'all', start, end)
}

function fetchEpisodeData (start, end) {
  console.debug('Fetching episode data', start, end)

  return fetchRange('aggregated', 'episodesByType', start, end)
}

function getData (key) {
  console.debug('Fetching aggregated data', key)

  return fetchRange('aggregated', 'byKey', key)
}

function getEpisodeData (key) {
  console.debug('Fetching episode data', key)

  return fetchRange('aggregated', 'episodesByKeyAndType', key)
}

function getGenreData (type) {
  console.debug('Fetching genre data', type)

  return fetchDB(type, 'all')
}

function getYearData (type, year) {
  console.debug('Fetching year data', type, year)

  return fetchRange(type, 'byYear', parseInt(year, 10))
}

function getTypesData (start, end) {
  console.debug('Fetching types data')

  return fetchRange('types', 'byYear', start, end)
}

function getTypes (year) {
  console.debug('Fetching types data', year)

  return fetchRange('types', 'byYear', parseInt(year, 10))
}

export default {
  fetchAllShows: fetchAllShows,
  fetchEpisodeData: fetchEpisodeData,
  getData: getData,
  getEpisodeData: getEpisodeData,
  getGenreData: getGenreData,
  getYearData: getYearData,
  getTypesData: getTypesData,
  getTypes: getTypes,
}
