/** @jsx h */
import '../js/debug'
import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Spinner } from '@nonsensebb/components'

import BaseLayout from '../js/components/layout/base'
import { buildTitle } from '../js/meta'

import '../css/main.css'

function WebsiteApp({ Component, pageProps }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const startLoading = () => setLoading(true)
    const stopLoading = () => setLoading(false)

    router.events.on('routeChangeStart', startLoading)
    router.events.on('routeChangeComplete', stopLoading)
    router.events.on('routeChangeError', stopLoading)

    return () => {
      router.events.off('routeChangeStart', startLoading)
      router.events.off('routeChangeComplete', stopLoading)
      router.events.off('routeChangeError', stopLoading)
    }
  }, [router, setLoading])

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title key="title">{buildTitle()}</title>
      </Head>

      <BaseLayout>
        {loading ? (
          <Spinner active />
        ) : (
          <Component {...pageProps} />
        )}
      </BaseLayout>

      <footer className="footer">
        <p>Updated: {new Date(process.env.NEXT_PUBLIC_BUILD_DATE).toLocaleDateString()}</p>
      </footer>
    </>
  )
}

export default WebsiteApp
