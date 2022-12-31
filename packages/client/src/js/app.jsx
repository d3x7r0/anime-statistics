import { h } from 'preact'

import { BUILD_DATE } from './config'
import { PageContextProvider } from './components/router/page-context'
import BaseLayout from './components/layout/base'

import "purecss/build/pure.css"
import "purecss/build/grids-responsive.css"
import '../css/main.css'

export function App ({ pageContext }) {
  const { Page, pageProps, errorWhileRendering } = pageContext

  return (
    <PageContextProvider pageContext={pageContext}>
      <BaseLayout>
        <Page error={errorWhileRendering} {...pageProps} />
      </BaseLayout>

      <footer className="footer">
        <p>Updated: {BUILD_DATE}</p>
      </footer>
    </PageContextProvider>
  )
}
