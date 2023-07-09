rm dist/public/bundle.js

# esm to cjs
babel dist/public --out-dir dist/public-cjs

# bundle
browserify dist/public-cjs > dist/public/bundle.js