import { h } from 'preact'
import renderToString from 'preact-render-to-string'
import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr'
import isFunction from 'lodash-es/isFunction'
import castArray from 'lodash-es/castArray'

import { App } from '../js/app'
import { buildTitle } from '../js/utils/meta'

// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = [
  'pageProps',
  'routeParams',
  'urlPathname',
  // Error page
  'is404',
  'errorWhileRendering',
  // Needed for preact devtools
  'type',
  'peek',
]

function loadDocumentProps(pageContext) {
  // See https://vite-plugin-ssr.com/head
  const { documentProps } = pageContext.exports

  return {
    ...(isFunction(documentProps) ? documentProps(pageContext) : documentProps),
  }
}

export async function render(pageContext) {
  const pageHtml = renderToString(
    <App pageContext={pageContext} />,
  )

  const documentProps = loadDocumentProps(pageContext)

  const title = buildTitle(
    ...castArray(documentProps.title)
  )

  const documentHtml = escapeInject `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
      </head>
      <body>
        ${dangerouslySkipEscape(pageHtml)}
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
    },
  }
}
