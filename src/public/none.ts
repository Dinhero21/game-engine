export type None = undefined | null

export function isNone (value: unknown): value is None {
  return value === undefined || value === null
}

export function valid<T> (value: T | None, error?: Error): T {
  if (isNone(value)) throw error ?? new TypeError('Expected value to not be None')

  return value
}
