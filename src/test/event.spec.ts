import { EventHandler, type EventMap } from '../util/event'
import { assert } from 'chai'

class PublicEventHandler<T extends EventMap<T>> extends EventHandler<T> {
  public async emit<E extends keyof T> (name: E, ...data: Parameters<T[E]>): Promise<void> {
    await this._emit(name, ...data)
  }
}

interface TestEventMap {
  test: () => void
}

describe('event', () => {
  describe('EventHandler', () => {
    it('sync', async () => {
      const handler = new PublicEventHandler<TestEventMap>()

      let count = 0

      handler.register('test', () => {
        count++
      })

      assert.equal(count, 0)

      void handler.emit('test')

      setTimeout(() => {
        assert.equal(count, 1)
      }, 100)
    })

    it('async', async () => {
      const handler = new PublicEventHandler<TestEventMap>()

      let count = 0

      handler.register('test', () => {
        count++
      })

      assert.equal(count, 0)

      await handler.emit('test')

      assert.equal(count, 1)
    })

    it('unregister (async)', async () => {
      const handler = new PublicEventHandler<TestEventMap>()

      let count = 0

      const cb = (): void => {
        count++
      }

      handler.register('test', cb)

      assert.equal(count, 0)

      await handler.emit('test')

      assert.equal(count, 1)

      handler.unregister('test', cb)

      assert.equal(count, 1)

      await handler.emit('test')

      assert.equal(count, 1)
    })

    it('clear (async)', async () => {
      const handler = new PublicEventHandler<TestEventMap>()

      let count = 0

      const cb = (): void => {
        count++
      }

      handler.register('test', cb)

      assert.equal(count, 0)

      await handler.emit('test')

      assert.equal(count, 1)

      handler.clear()

      assert.equal(count, 1)

      await handler.emit('test')

      assert.equal(count, 1)
    })

    it('multiple (async)', async () => {
      interface MultipleEventMap {
        foo: () => void
        bar: () => void
      }

      const handler = new PublicEventHandler<MultipleEventMap>()

      let fooCount = 0

      handler.register('foo', () => {
        fooCount++
      })

      let barCount = 0

      handler.register('bar', () => {
        barCount++
      })

      assert.equal(fooCount, 0)
      assert.equal(barCount, 0)

      await handler.emit('foo')

      assert.equal(fooCount, 1)
      assert.equal(barCount, 0)
    })
  })

  describe('EventFrame', () => {

  })
})
