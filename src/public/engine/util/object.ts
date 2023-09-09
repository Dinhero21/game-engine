export interface WatchCallBack {
  set?: (v: any) => void
  get?: () => void
}

export function watch<T extends Record<any, unknown>> (o: T, p: keyof T, cb: WatchCallBack): T {
  let value = o[p]

  const { set, get } = cb

  return Object.defineProperty(o, p, {
    set: v => {
      if (set !== undefined) set(v)

      value = v
    },
    get: () => {
      if (get !== undefined) get()

      return value
    }
  })
}
