const ID_SET = new Set<string>()

export function generateId (): string {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

export function getId (): string {
  while (true) {
    const id = generateId()

    if (ID_SET.has(id)) continue

    ID_SET.add(id)

    return id
  }
}
