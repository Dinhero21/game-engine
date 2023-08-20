import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import sourcemaps from 'rollup-plugin-sourcemaps'
import terser from '@rollup/plugin-terser'

const PRODUCTION = process.env.NODE_ENV === 'production'
const DEVELOPMENT = !PRODUCTION

const PLUGINS = []

// Node Modules
PLUGINS.push(
  resolve({
    browser: true
  }),
  commonjs()
)

// TypeScript
PLUGINS.push(
  babel({
    // include: ['node_modules/**'],
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
  input: 'dist/public/index.js',
  output: {
    sourcemap: DEVELOPMENT,
    file: 'dist/public/bundle.js',
    format: 'iife'
  },
  plugins: PLUGINS
}
