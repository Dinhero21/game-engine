import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'

export default {
  input: 'dist/public/index.js',
  output: {
    file: 'dist/public/bundle.js',
    format: 'cjs'
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    babel({
      include: ['node_modules/**'],
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env']
    })
  ]
}
