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
