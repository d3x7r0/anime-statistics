import { h, hydrate } from 'preact'

import { App } from '../js/app'

export async function render(pageContext) {
  hydrate(
    <App pageContext={pageContext} />,
    document.querySelector('body'),
  )
}
