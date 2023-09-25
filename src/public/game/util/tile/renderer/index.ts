// (Too lazy to fix the horrible word wrap alignment)
// ! This file is used to "defer" the loading of
// ! Custom Tile Renderers to post-RENDERER Map
// ! initialization since rollup-plugin-glob-import
// ! does not seem to allow that

// Load all Custom Tile Renderers
import './custom/*'

export * from './map'
