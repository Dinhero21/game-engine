import { assert } from 'chai'

describe('browser', () => {
  describe('global', () => {
    const GLOBALS = [
      'window',
      'document',
      'EventTarget',
      'Element'
    ]

    for (const name of GLOBALS) {
      it(name, () => {
        assert.ok(name in global)
      })
    }
  })
})
