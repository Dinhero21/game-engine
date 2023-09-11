// TODO: Make it so "optional" plugins only get imported if they are used

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import sourcemaps from 'rollup-plugin-sourcemaps'
import terser from '@rollup/plugin-terser'
import globImport from 'rollup-plugin-glob-import'

const PRODUCTION = process.env.NODE_ENV === 'production'
const DEVELOPMENT = !PRODUCTION

const PLUGINS = []

// Mods
PLUGINS.push(
  globImport()
)

// Node Modules
PLUGINS.push(
  resolve({
    browser: true
  }),
  commonjs()
)

// Bundling
PLUGINS.push(
  babel({
    include: ['node_modules/**'],
    babelHelpers: 'bundled',
    presets: ['@babel/preset-env'],
    targets: 'last 1 Chrome version'
  })
)

// SourceMaps
if (DEVELOPMENT) {
  PLUGINS.push(
    sourcemaps()
  )
}

// Minification
if (PRODUCTION) {
  PLUGINS.push(
    terser()
  )
}

export default {
  input: 'dist/public',
  output: {
    sourcemap: DEVELOPMENT,
    file: 'dist/public/bundle.js',
    format: 'iife'
  },
  plugins: PLUGINS
}
