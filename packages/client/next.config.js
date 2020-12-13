/* eslint-env node */
/* eslint-disable import/order */
const { resolve } = require('path')
const withPreact = require('next-plugin-preact')

const TRANSPILED_MODULES = [
  '@nonsensebb/components',
  'lodash-es',
]

const withTM = require('next-transpile-modules')(TRANSPILED_MODULES)

const nextConfig = {
  assetPrefix: process.env.NEXT_PUBLIC_BASE_URL || '',
  trailingSlash: true,
  experimental: {
    modern: true,
  },
  cssLoaderOptions: {
    url: false,
  },
  webpack(config) {
    TRANSPILED_MODULES.forEach((moduleName) => {
      const pkg = require(resolve(__dirname, '.', 'node_modules', moduleName, 'package.json'))

      Object.keys(pkg.peerDependencies || {}).forEach(dep => {
        config.resolve.alias[dep] = resolve(__dirname, '.', 'node_modules', dep)
      })
    })

    config.module.rules.push(
      {
        test: /\.(svg|md)$/,
        loader: 'raw-loader',
      },
    )

    // Install webpack aliases:
    const aliases = config.resolve.alias || (config.resolve.alias = {})
    aliases.lodash = 'lodash-es'

    return config
  },
}

module.exports = withTM(
  withPreact(nextConfig),
)
