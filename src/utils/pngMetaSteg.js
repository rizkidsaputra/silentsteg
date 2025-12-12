// PNG Metadata Steganography Module
// Parses PNG chunks and embeds/extracts metadata without backend

/**
 * Embed text into PNG metadata
 * @param {File} imageFile - PNG image file
 * @param {string} field - Metadata field name (key)
 * @param {string} text - Text to embed (value)
 * @returns {Promise<{success: boolean, outputImage: Blob, fileName: string}>}
 */
export async function embedPngMeta(imageFile, field, text) {
  try {
    // Read PNG as ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Parse PNG chunks
    const chunks = parsePngChunks(uint8Array)

    // Find IHDR chunk to preserve it at the start
    const ihdrIndex = chunks.findIndex((c) => c.type === "IHDR")
    if (ihdrIndex === -1) {
      throw new Error("Invalid PNG: missing IHDR chunk")
    }

    // Extract existing tEXt/iTXt chunks and preserve them
    const existingMetadata = {}
    const nonMetadataChunks = []

    chunks.forEach((chunk, index) => {
      if (chunk.type === "tEXt" || chunk.type === "iTXt") {
        const { key, value } = parseTextChunk(chunk)
        existingMetadata[key] = value
      } else if (chunk.type !== "IEND") {
        // Keep all other chunks except IEND
        nonMetadataChunks.push(chunk)
      }
    })

    // Add or update the new metadata field
    existingMetadata[field] = text

    // Rebuild chunk array: IHDR + data chunks + metadata + IEND
    const newChunks = [chunks[ihdrIndex], ...nonMetadataChunks]

    // Add all metadata as tEXt chunks
    for (const [key, value] of Object.entries(existingMetadata)) {
      newChunks.push(createTextChunk(key, value))
    }

    // Add IEND chunk
    newChunks.push(createIendChunk())

    // Encode back to PNG
    const outputBuffer = encodePngChunks(newChunks)
    const outputBlob = new Blob([outputBuffer], { type: "image/png" })

    return {
      success: true,
      outputImage: outputBlob,
      fileName: `stego_${imageFile.name.replace(/\.png$/i, "")}_meta.png`,
    }
  } catch (error) {
    console.error("[pngMetaSteg] embedPngMeta error:", error)
    throw new Error(`Failed to embed PNG metadata: ${error.message}`)
  }
}

/**
 * Extract metadata from PNG
 * @param {File} imageFile - PNG image file
 * @returns {Promise<{metadata: Record<string, string>}>}
 */
export async function extractPngMeta(imageFile) {
  try {
    // Read PNG as ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Parse PNG chunks
    const chunks = parsePngChunks(uint8Array)

    // Extract all tEXt and iTXt chunks
    const metadata = {}
    chunks.forEach((chunk) => {
      if (chunk.type === "tEXt" || chunk.type === "iTXt") {
        const { key, value } = parseTextChunk(chunk)
        metadata[key] = value
      }
    })

    return { metadata }
  } catch (error) {
    console.error("[pngMetaSteg] extractPngMeta error:", error)
    throw new Error(`Failed to extract PNG metadata: ${error.message}`)
  }
}

/**
 * Parse PNG file into chunks
 * @param {Uint8Array} pngData - Raw PNG data
 * @returns {Array<{type: string, data: Uint8Array}>}
 */
function parsePngChunks(pngData) {
  const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]

  // Verify PNG signature
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (pngData[i] !== PNG_SIGNATURE[i]) {
      throw new Error("Invalid PNG signature")
    }
  }

  const chunks = []
  let offset = 8 // Skip PNG signature

  while (offset < pngData.length) {
    // Read chunk length (4 bytes, big-endian)
    const length = readUint32BE(pngData, offset)
    offset += 4

    // Read chunk type (4 bytes)
    const typeBytes = pngData.slice(offset, offset + 4)
    const type = String.fromCharCode(...typeBytes)
    offset += 4

    // Read chunk data
    const data = pngData.slice(offset, offset + length)
    offset += length

    // Read CRC (4 bytes) - we'll skip validation but read it
    offset += 4

    chunks.push({ type, data })

    if (type === "IEND") break
  }

  return chunks
}

/**
 * Parse tEXt or iTXt chunk to extract key-value pair
 * @param {Object} chunk - PNG chunk with type and data
 * @returns {{key: string, value: string}}
 */
function parseTextChunk(chunk) {
  const data = chunk.data

  // Find null separator between key and value
  let keyEndIndex = 0
  for (let i = 0; i < data.length; i++) {
    if (data[i] === 0) {
      keyEndIndex = i
      break
    }
  }

  const key = new TextDecoder().decode(data.slice(0, keyEndIndex))
  const value = new TextDecoder().decode(data.slice(keyEndIndex + 1))

  return { key, value }
}

/**
 * Create a tEXt chunk for metadata
 * @param {string} key - Metadata key
 * @param {string} value - Metadata value
 * @returns {{type: string, data: Uint8Array}}
 */
function createTextChunk(key, value) {
  const keyBytes = new TextEncoder().encode(key)
  const valueBytes = new TextEncoder().encode(value)

  // tEXt format: key \0 value
  const data = new Uint8Array(keyBytes.length + 1 + valueBytes.length)
  data.set(keyBytes, 0)
  data[keyBytes.length] = 0 // null separator
  data.set(valueBytes, keyBytes.length + 1)

  return { type: "tEXt", data }
}

/**
 * Create IEND chunk (end of PNG)
 * @returns {{type: string, data: Uint8Array}}
 */
function createIendChunk() {
  return { type: "IEND", data: new Uint8Array(0) }
}

/**
 * Encode chunks back into PNG format
 * @param {Array<{type: string, data: Uint8Array}>} chunks
 * @returns {Uint8Array} Complete PNG data
 */
function encodePngChunks(chunks) {
  const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

  // Calculate total size
  let totalSize = PNG_SIGNATURE.length
  chunks.forEach((chunk) => {
    totalSize += 4 // length
    totalSize += 4 // type
    totalSize += chunk.data.length // data
    totalSize += 4 // crc
  })

  const result = new Uint8Array(totalSize)
  let offset = 0

  // Write PNG signature
  result.set(PNG_SIGNATURE, offset)
  offset += PNG_SIGNATURE.length

  // Write chunks
  chunks.forEach((chunk) => {
    // Write length (big-endian)
    writeUint32BE(result, offset, chunk.data.length)
    offset += 4

    // Write type
    const typeBytes = new TextEncoder().encode(chunk.type)
    result.set(typeBytes, offset)
    offset += 4

    // Write data
    result.set(chunk.data, offset)
    offset += chunk.data.length

    // Calculate and write CRC (type + data)
    const crcData = new Uint8Array(4 + chunk.data.length)
    crcData.set(typeBytes, 0)
    crcData.set(chunk.data, 4)
    const crc = calculateCrc(crcData)
    writeUint32BE(result, offset, crc)
    offset += 4
  })

  return result
}

/**
 * Read 32-bit big-endian unsigned integer
 */
function readUint32BE(buffer, offset) {
  return (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3]
}

/**
 * Write 32-bit big-endian unsigned integer
 */
function writeUint32BE(buffer, offset, value) {
  buffer[offset] = (value >> 24) & 0xff
  buffer[offset + 1] = (value >> 16) & 0xff
  buffer[offset + 2] = (value >> 8) & 0xff
  buffer[offset + 3] = value & 0xff
}

/**
 * Calculate CRC for PNG chunk (using polynomial 0xEDB88320)
 */
function calculateCrc(data) {
  const CRC_TABLE = makeCrcTable()
  let crc = 0xffffffff

  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0 // Convert to unsigned 32-bit
}

/**
 * Generate CRC lookup table for PNG
 */
function makeCrcTable() {
  const table = new Uint32Array(256)

  for (let i = 0; i < 256; i++) {
    let crc = i
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    }
    table[i] = crc >>> 0
  }

  return table
}
