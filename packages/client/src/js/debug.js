import { options } from 'preact'

if (process.env.NODE_ENV !== 'production') {
  const oldHook = options.vnode

  options.vnode = vnode => {
    // Remove __self and __source from attributes
    delete vnode.props['__self']
    delete vnode.props['__source']

    // Call previously defined hook if there was any
    if (oldHook) {
      oldHook(vnode)
    }
  }
}

if (module.hot) {
  // FIX for css not loading on page change
  module.hot.addStatusHandler(status => {
    if (typeof window !== 'undefined' && status === 'ready') {
      window.__webpack_reload_css__ = true
    }
  })
}
