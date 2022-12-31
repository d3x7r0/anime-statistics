import { h } from 'preact'

import { PATHS, TITLES } from '../../config'

function SiteHeader() {
  return (
    <header className="pure-menu pure-menu-horizontal top-menu">
      <h1 className="pure-menu-heading site-title">
        {TITLES.SITE}
      </h1>

      <ul className="pure-menu-list">
        <li className="pure-menu-item">
          <a href={PATHS.GENRE} className="pure-menu-link">
            {TITLES.GENRE}
          </a>
        </li>
        <li className="pure-menu-item">
          <a href={PATHS.YEAR} className="pure-menu-link">
            {TITLES.YEAR}
          </a>
        </li>
        <li className="pure-menu-item">
          <a href={PATHS.TYPES} className="pure-menu-link">
            {TITLES.TYPES}
          </a>
        </li>
      </ul>
    </header>
  )
}

export default SiteHeader
