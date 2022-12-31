import { defineConfig, loadEnv } from 'vite'
import preact from '@preact/preset-vite'
import analyze from 'rollup-plugin-analyzer'
import ssr from 'vite-plugin-ssr/plugin'

export default defineConfig(({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  const plugins = [
    preact(),
    ssr({
      partial: true,
      prerender: true,
      parallel: false,
    }),
  ]

  if (process.env.ANALYZE) {
    plugins.push(
      analyze({
        summaryOnly: true,
      }),
    )
  }

  return {
    build: {
      sourcemap: true,
    },
    define: {
      __BUILD_DATE__: `"${(new Date()).toISOString()}"`,
    },
    // We manually add a list of dependencies to be pre-bundled, in order to avoid a page reload at dev start which breaks vite-plugin-ssr's CI
    plugins,
    optimizeDeps: {
      include: [
        'preact/devtools',
        'preact/debug',
        'preact/jsx-dev-runtime',
        'preact',
        'preact/hooks',
      ],
    },
    resolve: {
      alias: {
        'lodash': 'lodash-es',
      },
    }
  }
})
