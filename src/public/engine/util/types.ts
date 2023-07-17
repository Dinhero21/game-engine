export type ExtractValues<T, V> = {
  [Key in keyof T as T[Key] extends V ? Key : never]: T[Key]
}

export type ExcludeValues<T, V> = {
  [Key in keyof T as T[Key] extends V ? never : Key]: T[Key]
}

export type ExtractKeys<T, V> = keyof {
  [Key in keyof T as T[Key] extends V ? Key : never]: T[Key];
}

export type ExcludeKeys<T, V> = keyof {
  [Key in keyof T as T[Key] extends V ? never : Key]: T[Key];
}

export type AnyFunction = (...args: any[]) => any

export type MaybeReturnType<T> = T extends (...args: any[]) => infer R ? R : any
export type MaybeParameters<T> = T extends AnyFunction ? Parameters<T> : any
export type MaybeFunction<T> = (...args: MaybeParameters<T>) => MaybeReturnType<T>

export type FunctionKeys<T> = ExtractKeys<T, AnyFunction>
