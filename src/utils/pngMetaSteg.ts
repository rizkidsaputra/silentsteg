/**
 * PNG Metadata Steganography (SAFE VERSION)
 * - Uses tEXt chunk only (most compatible)
 * - Preserves PNG structure & chunk order
 * - Does NOT corrupt image
 */

/* =========================================================
   PUBLIC API
========================================================= */

export async function embedPngMeta(
  imageFile: File,
  key: string,
  value: string
): Promise<{ success: boolean; outputImage: Blob; fileName: string }> {
  const buffer = new Uint8Array(await imageFile.arrayBuffer())
  const chunks = parsePngChunks(buffer)

  const ihdr = chunks.find(c => c.type === "IHDR")
  const idatChunks = chunks.filter(c => c.type === "IDAT")

  if (!ihdr || idatChunks.length === 0) {
    throw new Error("Invalid PNG structure")
  }

  // Keep all non-critical chunks except old tEXt
  const otherChunks = chunks.filter(
    c =>
      c.type !== "IHDR" &&
      c.type !== "IDAT" &&
      c.type !== "IEND" &&
      c.type !== "tEXt"
  )

  // Create metadata chunk
  const textChunk = createTextChunk(key, value)

  /**
   * PNG ORDER (VALID):
   * IHDR
   * tEXt (metadata)
   * other chunks (PLTE, etc)
   * IDAT (image data)
   * IEND
   */
  const finalChunks = [
    ihdr,
    textChunk,
    ...otherChunks,
    ...idatChunks,
    createIendChunk(),
  ]

  const output = encodePngChunks(finalChunks)

  return {
    success: true,
    outputImage: new Blob([output], { type: "image/png" }),
    fileName: `stego_${imageFile.name.replace(/\.png$/i, "")}_meta.png`,
  }
}

export async function extractPngMeta(
  imageFile: File
): Promise<{ metadata: Record<string, string> }> {
  const buffer = new Uint8Array(await imageFile.arrayBuffer())
  const chunks = parsePngChunks(buffer)

  const metadata: Record<string, string> = {}

  chunks.forEach(chunk => {
    if (chunk.type === "tEXt") {
      const { key, value } = parseTextChunk(chunk.data)
      metadata[key] = value
    }
  })

  return { metadata }
}

/* =========================================================
   PNG CORE
========================================================= */

function parsePngChunks(data: Uint8Array): { type: string; data: Uint8Array }[] {
  const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]

  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (data[i] !== PNG_SIGNATURE[i]) {
      throw new Error("Invalid PNG signature")
    }
  }

  const chunks = []
  let offset = 8

  while (offset < data.length) {
    const length = readUint32BE(data, offset)
    offset += 4

    const type = String.fromCharCode(...data.slice(offset, offset + 4))
    offset += 4

    const chunkData = data.slice(offset, offset + length)
    offset += length

    offset += 4 // skip CRC

    chunks.push({ type, data: chunkData })

    if (type === "IEND") break
  }

  return chunks
}

function encodePngChunks(chunks: { type: string; data: Uint8Array }[]): Uint8Array {
  const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

  let size = PNG_SIGNATURE.length
  for (const chunk of chunks) {
    size += 12 + chunk.data.length
  }

  const out = new Uint8Array(size)
  let offset = 0

  out.set(PNG_SIGNATURE, offset)
  offset += PNG_SIGNATURE.length

  for (const chunk of chunks) {
    writeUint32BE(out, offset, chunk.data.length)
    offset += 4

    const typeBytes = new TextEncoder().encode(chunk.type)
    out.set(typeBytes, offset)
    offset += 4

    out.set(chunk.data, offset)
    offset += chunk.data.length

    const crcInput = new Uint8Array(4 + chunk.data.length)
    crcInput.set(typeBytes, 0)
    crcInput.set(chunk.data, 4)

    const crc = calculateCrc(crcInput)
    writeUint32BE(out, offset, crc)
    offset += 4
  }

  return out
}

/* =========================================================
   tEXt CHUNK
========================================================= */

function createTextChunk(key: string, value: string) {
  const keyBytes = new TextEncoder().encode(key)
  const valueBytes = new TextEncoder().encode(value)

  const data = new Uint8Array(keyBytes.length + 1 + valueBytes.length)
  data.set(keyBytes, 0)
  data[keyBytes.length] = 0
  data.set(valueBytes, keyBytes.length + 1)

  return { type: "tEXt", data }
}

function parseTextChunk(data: Uint8Array) {
  const sep = data.indexOf(0)
  return {
    key: new TextDecoder().decode(data.slice(0, sep)),
    value: new TextDecoder().decode(data.slice(sep + 1)),
  }
}

function createIendChunk() {
  return { type: "IEND", data: new Uint8Array(0) }
}

/* =========================================================
   UTILITIES
========================================================= */

function readUint32BE(buf: Uint8Array, off: number) {
  return (
    (buf[off] << 24) |
    (buf[off + 1] << 16) |
    (buf[off + 2] << 8) |
    buf[off + 3]
  ) >>> 0
}

function writeUint32BE(buf: Uint8Array, off: number, val: number) {
  buf[off] = (val >>> 24) & 0xff
  buf[off + 1] = (val >>> 16) & 0xff
  buf[off + 2] = (val >>> 8) & 0xff
  buf[off + 3] = val & 0xff
}

/* =========================================================
   CRC32 (PNG STANDARD)
========================================================= */

function calculateCrc(data: Uint8Array) {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }
  return table
})()
