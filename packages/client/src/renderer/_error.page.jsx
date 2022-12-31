/* eslint-disable react/jsx-no-literals */
import { h } from 'preact'

import { TITLES } from '../js/config'

export function documentProps (pageContext) {
  return {
    robots: "noindex",
    title: pageContext?.props?.is404
      ? TITLES.NOT_FOUND
      : TITLES.ERROR,
  }
}

function Page({ is404, error }) {
  return is404
    ? <h1>Page not found</h1>
    : (
      <>
        <h1>Error!</h1>
        <pre>{ JSON.stringify(error, null, 2) }</pre>
      </>
    )
}

export { Page }
