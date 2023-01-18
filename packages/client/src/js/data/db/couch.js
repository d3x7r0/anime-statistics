import fetch from 'isomorphic-fetch'

export async function fetchDB(design, view, startKey = undefined, endKey = undefined, opts = {}) {
  const parts = [
    `${process.env.COUCHDB_URL}/_design/${design}/_view/${view}?group=true`,
  ]

  if (startKey) {
    parts.push(`startkey=${encodeURIComponent(startKey)}`)
  }

  if (endKey) {
    parts.push(`endkey=${encodeURIComponent(endKey)}`)
  }

  parts.push(
    ...Object.entries(opts).map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`
    }),
  )

  const url = parts.join('&')

  console.debug('Fetching url: %s', url)

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(res.statusText)
  }

  const data = await res.json()

  return data.rows
}

export function fetchArrayRange(design, view, start, end, opts = {}) {
  const a = JSON.stringify(start)
  const b = JSON.stringify(end || start)

  const arity = opts.arity || 2
  const inverted = opts.inverted === true

  let startKey
  let endKey

  if (inverted) {
    startKey = `[${Array.from({ length: arity - 1 })
      .map(() => '{}')
      .concat(a)
      .join(', ')}]`
  } else {
    startKey = `[${a}]`
  }

  if (inverted) {
    endKey = `[${b}]`
  } else {
    endKey = `[${b}, ${Array.from({ length: arity - 1 })
      .map(() => '{}')
      .join(', ')}]`
  }

  return fetchDB(design, view, startKey, endKey, inverted ? { descending: true } : undefined)
}
