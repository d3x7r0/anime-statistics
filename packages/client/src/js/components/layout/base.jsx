/** @jsx h */
import { h } from 'preact'

import SiteHeader from '../organism/site-header'

export default function BaseLayout({ children }) {
  return (
    <>
      <SiteHeader />

      <main>
        {children}
      </main>
    </>
  )
}
