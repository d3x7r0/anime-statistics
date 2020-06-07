/** @jsx h */
import { h } from 'preact'
import Link from 'next/link'

import { TITLES } from '../../config'

function SiteHeader() {
  return (
    <header className="pure-menu pure-menu-horizontal top-menu">
      <h1 className="pure-menu-heading site-title">
        {TITLES.SITE}
      </h1>

      <ul className="pure-menu-list">
        <li className="pure-menu-item">
          <Link
            href="/"
            passHref
          >
            <a className="pure-menu-link">
              {TITLES.GENRE}
            </a>
          </Link>
        </li>
        <li className="pure-menu-item">
          <Link
            href="/year"
            passHref
          >
            <a className="pure-menu-link">
              {TITLES.YEAR}
            </a>
          </Link>
        </li>
        <li className="pure-menu-item">
          <Link
            href="/types"
            passHref
          >
            <a className="pure-menu-link">
              {TITLES.TYPES}
            </a>
          </Link>
        </li>
      </ul>
    </header>
  )
}

export default SiteHeader
