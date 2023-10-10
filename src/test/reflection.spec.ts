import { Merge } from '../public/engine/util/reflection'
import { assert } from 'chai'

describe('reflection', () => {
  describe('class merge', () => {
    it('public fields', () => {
      class A {
        public a = true
      }

      class B {
        public b = true
      }

      const C = Merge(A, B)

      const c = new C()

      assert.isTrue(c.a, 'expected A & B ⊆ A')
      assert.isTrue(c.b, 'expected A & B ⊆ B')
    })

    it('methods', () => {
      class A {
        public a (): 'a' { return 'a' }
      }

      class B {
        public b (): 'b' { return 'b' }
      }

      const C = Merge(A, B)

      const c = new C()

      assert.isDefined(c.a, 'expected A & B ⊆ A')
      assert.isDefined(c.b, 'expected A & B ⊆ B')

      assert.strictEqual(c.a(), 'a', 'expected A & B ⊆ A')
      assert.strictEqual(c.b(), 'b', 'expected A & B ⊆ B')
    })

    describe('static', () => {
      it('fields', () => {
        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        class A {
          static a = true
        }

        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        class B {
          static b = true
        }

        const C = Merge(A, B)

        assert.isTrue(C.a, 'expected A & B ⊆ A')
        assert.isTrue(C.b, 'expected A & B ⊆ B')
      })

      it('methods', () => {
        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        class A {
          public static a (): 'a' { return 'a' }
        }

        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        class B {
          public static b (): 'b' { return 'b' }
        }

        const C = Merge(A, B)

        assert.isDefined(C.a, 'expected A & B ⊆ A')
        assert.isDefined(C.b, 'expected A & B ⊆ B')

        assert.strictEqual(C.a(), 'a', 'expected A & B ⊆ A')
        assert.strictEqual(C.b(), 'b', 'expected A & B ⊆ B')
      })
    })

    it('mutation', () => {
      // eslint-disable-next-line @typescript-eslint/no-extraneous-class
      class A {}

      // eslint-disable-next-line @typescript-eslint/no-extraneous-class
      class B {}

      // @ts-expect-error state can not be defined on the instance
      A.prototype.state = 'old'

      const C = Merge(A, B)

      // @ts-expect-error state can not be defined on the instance
      A.prototype.state = 'new'

      const c = new C()

      assert.strictEqual((c as any).state, 'new', 'expected C to mutate when A does')
    })

    describe('inheritance', () => {
      it('override order', () => {
        class A {
          public method1 (): string {
            return 'a'
          }
        }

        class B {
          public method2 (): string {
            return 'b'
          }
        }

        const AB = Merge(A, B)

        class C extends AB {
          public method1 (): string {
            return 'c'
          }
        }

        const c = new C()

        assert.strictEqual(c.method1(), 'c', 'expected C to override A & B')
        assert.strictEqual(c.method2(), 'b', 'expected C to not override A & B')
      })

      it('super', () => {
        class A {
          public get (): string {
            return 'A'
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        class B {}

        const AB = Merge(A, B)

        class C extends AB {
          public get (): string {
            const get = super.get

            if (get === undefined) throw new TypeError('super.get undefined')

            return get()
          }
        }

        const c = new C()

        assert.strictEqual(c.get(), 'A', 'expected super to equal A & B')
      })
    })
  })
})
