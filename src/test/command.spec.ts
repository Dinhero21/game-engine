import { parseArgs } from '../util/command'
import { assert } from 'chai'

describe('command', () => {
  describe('args', () => {
    it('empty', () => {
      const raw = ''
      const args: any[] = Array.from(parseArgs(raw))

      assert.deepEqual(args, [])
    })

    describe('number', () => {
      it('simple', () => {
        const raw = '137'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [137])
      })

      it('negative', () => {
        const raw = '-137'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [-137])
      })

      it('scientific notation', () => {
        const raw = '1.37e3'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [1.37e3])
      })

      // it('binary', () => {
      //   const raw = '0b1101'
      //   const args: any[] = Array.from(parseArgs(raw))

      //   assert.deepEqual(args, [0b1101])
      // })

      // it('octal', () => {
      //   const raw = '0o372'
      //   const args: any[] = Array.from(parseArgs(raw))

      //   assert.deepEqual(args, [0o372])
      // })

      it('hexadecimal', () => {
        const raw = '0xDECAFF'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [0xDECAFF])
      })

      it('Infinity', () => {
        const raw = 'Infinity'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [Infinity])
      })

      it('NaN', () => {
        const raw = 'NaN'
        const args: any[] = Array.from(parseArgs(raw))

        assert.isArray(args)
        assert.lengthOf(args, 1)
        assert.isNaN(args[0])
      })
    })

    describe('string', () => {
      it('single quotes', () => {
        const raw = '\'test\''
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, ['test'])
      })

      it('double quotes', () => {
        const raw = '"test"'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, ['test'])
      })
    })

    it('boolean', () => {
      const raw = 'true'
      const args: any[] = Array.from(parseArgs(raw))

      assert.deepEqual(args, [true])
    })

    it('null', () => {
      const raw = 'null'
      const args: any[] = Array.from(parseArgs(raw))

      assert.deepEqual(args, [null])
    })

    // it('undefined', () => {
    //   const raw = 'undefined'
    //   const args: any[] = Array.from(parseArgs(raw))

    //   assert.deepEqual(args, [undefined])
    // })

    describe('array', () => {
      it('empty', () => {
        const raw = '[]'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [[]])
      })

      it('numbers', () => {
        const raw = '[1,2,3]'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [[1, 2, 3]])
      })
    })

    describe('object', () => {
      it('empty', () => {
        const raw = '{}'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [{}])
      })

      it('double quoted key', () => {
        const raw = '{"foo":"bar"}'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [{ foo: 'bar' }])
      })

      it('double quoted key', () => {
        const raw = '{\'foo\':"bar"}'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [{ foo: 'bar' }])
      })

      it('unquoted key', () => {
        const raw = '{foo:"bar"}'
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [{ foo: 'bar' }])
      })
    })

    describe('multiple args', () => {
      const BOOLEAN_ARRAY = [true, false] as const

      it('spaced', () => {
        const raw = BOOLEAN_ARRAY.join(' ')
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [true, false])
      })

      it('concatenated', () => {
        const raw = BOOLEAN_ARRAY.join('')
        const args: any[] = Array.from(parseArgs(raw))

        assert.deepEqual(args, [true, false])
      })
    })
  })
})
