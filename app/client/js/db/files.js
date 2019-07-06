const FILES = {
  data: () => import('../../../../data/data.json'),
  dataGenres: () => import('../../../../data/data_genres.json'),
  dataThemes: () => import('../../../../data/data_themes.json'),
  episodeData: () => import('../../../../data/episode_data.json'),
  episodeTotals: () => import('../../../../data/episode_totals.json'),
  genres: () => import('../../../../data/genres.json'),
  themes: () => import('../../../../data/themes.json'),
  totals: () => import('../../../../data/totals.json'),
  types: () => import('../../../../data/types.json'),
}

function fetchFile (file) {
  return file().then(data => ({ ...data }))
}

function getLimitedData (file, start, end) {
  return fetchFile(file).then(data => {
    data.rows = data.rows.filter(
      entry => entry.key[0] >= start && entry.key[0] <= end,
    )

    return data
  })
}

function getFilteredData (file, entry) {
  return fetchFile(file).then(data => {
    data.rows = data.rows.filter(e => e.key[0] === entry)

    return data
  })
}

// url: /_design/aggregated/_view/all?group=true
export function fetchAllShows (start, end) {
  console.debug('Fetching all shows', start, end)

  return fetchFile(FILES['totals']).then(data => {
    data.rows = data.rows.filter(
      entry => entry.key >= start && entry.key <= end,
    )

    return data
  })
}

// url: /_design/aggregated/_view/episodesByType?group=true
export function fetchEpisodeData (start, end) {
  console.debug('Fetching episode data', start, end)

  return getLimitedData(FILES['episodeTotals'], start, end)
}

// url: /_design/aggregated/_view/byKey?group=true
export function getData (key) {
  console.debug('Fetching aggregated data', key)

  return getFilteredData(FILES['data'], key)
}

// url: /_design/aggregated/_view/episodesByKeyAndType?group=true
export function getEpisodeData (key) {
  console.debug('Fetching episode data', key)

  return getFilteredData(FILES['episodeData'], key)
}

// url: /_design/genre/_view/all?group=true
// url: /_design/themes/_view/all?group=true
export function getGenreData (type) {
  console.debug('Fetching genre data', type)

  switch (type) {
    case 'genres':
      return fetchFile(FILES['genres'])
    case 'themes':
      return fetchFile(FILES['themes'])
    default:
      return Promise.reject(new Error('Unknown genre'))
  }
}

// url: /_design/genres/_view/byYear?group=true
// url: /_design/themes/_view/byYear?group=true
export function getYearData (type, year) {
  console.debug('Fetching year data', type, year)

  year = parseInt(year, 10)

  switch (type) {
    case 'genres':
      return getFilteredData(FILES['dataGenres'], year)
    case 'themes':
      return getFilteredData(FILES['dataThemes'], year)
    default:
      return Promise.reject(new Error('Unknown genre'))
  }
}

// url: /_design/types/_view/byYear?group=true&startkey=[1975]&endkey=[1975,{}];
export function getTypesData (start, end) {
  console.debug('Fetching types data')

  return getLimitedData(FILES['types'], start, end)
}

// url: /_design/types/_view/byYear?group=true
export function getTypes (year) {
  console.debug('Fetching types data', year)

  return getFilteredData(FILES['types'], parseInt(year, 10))
}
