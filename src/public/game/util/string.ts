export function chunk (input: string, size: number): string[] {
  const chunkLength = Math.ceil(input.length / size)
  const chunks = new Array(chunkLength)

  for (let i = 0, o = 0; i < chunkLength; ++i, o += size) {
    chunks[i] = input.slice(o, o + size)
  }

  return chunks
}
