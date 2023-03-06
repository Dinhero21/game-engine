export type None = undefined | null

export function isNone (value: unknown): value is None {
  return value === undefined || value === null
}
