// TODO: Make it so "optional" plugins only get imported if they are used

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import sourcemaps from 'rollup-plugin-sourcemaps'
import terser from '@rollup/plugin-terser'
import globImport from 'rollup-plugin-glob-import'
import livereload from 'rollup-plugin-livereload'

const PRODUCTION = process.env.NODE_ENV === 'production'
const DEVELOPMENT = !PRODUCTION

const WATCHING = process.env.ROLLUP_WATCH === 'true'

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

if (DEVELOPMENT) {
  // SourceMaps
  PLUGINS.push(
    sourcemaps()
  )

  if (WATCHING) {
  // LiveReload
    PLUGINS.push(
      livereload({})
    )
  }
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
