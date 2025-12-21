// ===================== Helper Functions =====================

/**
 * Derive AES key from password using SHA-256 (matching Python implementation)
 */
async function getKey(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return new Uint8Array(hashBuffer)
}

/**
 * Encrypt data using AES-CFB mode (matching Python struct.pack big-endian)
 * Returns: [IV (16 bytes)][Ciphertext]
 */
async function encryptData(data, password) {
  if (password === "" || password.length === 0) {
    return data
  }

  const key = await getKey(password)
  const iv = crypto.getRandomValues(new Uint8Array(16))

  // Import key for WebCrypto
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-CFB", length: 256 }, false, ["encrypt"])

  // Encrypt using AES-CFB
  const encrypted = await crypto.subtle.encrypt({ name: "AES-CFB", iv }, cryptoKey, data)

  // Combine IV + encrypted data
  const result = new Uint8Array(16 + encrypted.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(encrypted), 16)

  return result
}

/**
 * Decrypt data using AES-CFB mode
 */
async function decryptData(data, password) {
  if (password === "" || password.length === 0) {
    return data
  }

  const key = await getKey(password)
  const iv = data.slice(0, 16)
  const ciphertext = data.slice(16)

  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-CFB", length: 256 }, false, ["decrypt"])

  const decrypted = await crypto.subtle.decrypt({ name: "AES-CFB", iv }, cryptoKey, ciphertext)

  return new Uint8Array(decrypted)
}

/**
 * Convert image to PNG if it's JPG (matching Python prepare_image)
 */
async function prepareImage(imageFile) {
  const fileName = imageFile.name.toLowerCase()

  if (!fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg")) {
    return imageFile
  }

  // Read JPG and convert to PNG via canvas
  const arrayBuffer = await imageFile.arrayBuffer()
  const blob = new Blob([arrayBuffer], { type: "image/jpeg" })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  return new Promise((resolve, reject) => {
    img.onload = async () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((pngBlob) => {
        URL.revokeObjectURL(url)
        const newFile = new File([pngBlob], imageFile.name.replace(/\.(jpg|jpeg)$/i, ".png"), {
          type: "image/png",
        })
        resolve(newFile)
      }, "image/png")
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Load image as ImageData for pixel manipulation
 */
async function loadImageData(imageFile) {
  const arrayBuffer = await imageFile.arrayBuffer()
  const blob = new Blob([arrayBuffer], { type: imageFile.type })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      URL.revokeObjectURL(url)
      resolve(imageData)
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Encode LSB payload into image (matching Python encode_lsb exactly)
 */
async function encodeLSB(imageFile, payload) {
  const imageData = await loadImageData(imageFile)
  const { width, height, data: pixels } = imageData

  // Calculate capacity: each pixel has 3 channels, each channel stores 1 bit
  const maxCapacity = (width * height * 3) / 8
  const payloadLen = payload.length

  if (payloadLen > maxCapacity) {
    throw new Error(`Data too large (${payloadLen} bytes). Maximum capacity: ${maxCapacity} bytes`)
  }

  // Convert payload to binary string (8 bits per byte)
  let binary = ""
  for (let i = 0; i < payload.length; i++) {
    binary += payload[i].toString(2).padStart(8, "0")
  }

  const dataLen = binary.length
  let idx = 0

  // Embed bits into LSB of each RGB channel
  for (let pixelIdx = 0; pixelIdx < pixels.length; pixelIdx += 4) {
    if (idx >= dataLen) break

    // Process R, G, B channels (skip alpha channel at pixelIdx + 3)
    for (let channel = 0; channel < 3; channel++) {
      if (idx < dataLen) {
        const bit = Number.parseInt(binary[idx])
        pixels[pixelIdx + channel] = (pixels[pixelIdx + channel] & ~1) | bit
        idx++
      }
    }
  }

  // Convert modified imageData back to PNG blob
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  ctx.putImageData(imageData, 0, 0)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, "image/png")
  })
}

/**
 * Decode LSB payload from image (matching Python decode_lsb exactly)
 */
async function decodeLSB(imageFile) {
  const imageData = await loadImageData(imageFile)
  const { width, height, data: pixels } = imageData

  const bits = []

  // Extract LSB from each RGB channel
  for (let pixelIdx = 0; pixelIdx < pixels.length; pixelIdx += 4) {
    // Extract R, G, B channels (skip alpha)
    bits.push(pixels[pixelIdx] & 1) // R
    bits.push(pixels[pixelIdx + 1] & 1) // G
    bits.push(pixels[pixelIdx + 2] & 1) // B
  }

  // Convert bits back to bytes
  const byteData = []
  for (let i = 0; i < bits.length; i += 8) {
    const byteBits = bits.slice(i, i + 8)
    if (byteBits.length === 8) {
      const byte = Number.parseInt(byteBits.join(""), 2)
      byteData.push(byte)
    }
  }

  return new Uint8Array(byteData)
}

/**
 * Pack number into 4-byte big-endian format (matching struct.pack(">I", ...))
 */
function packBigEndian(value) {
  const buffer = new Uint8Array(4)
  buffer[0] = (value >> 24) & 0xff
  buffer[1] = (value >> 16) & 0xff
  buffer[2] = (value >> 8) & 0xff
  buffer[3] = value & 0xff
  return buffer
}

/**
 * Unpack 4-byte big-endian to number (matching struct.unpack(">I", ...))
 */
function unpackBigEndian(buffer, offset = 0) {
  return (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3]
}

/**
 * Concatenate multiple Uint8Arrays
 */
function concatArrays(...arrays) {
  const totalLen = arrays.reduce((sum, arr) => sum + arr.length, 0)
  const result = new Uint8Array(totalLen)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

// ===================== Public API =====================

/**
 * Embed text into image using LSB steganography
 * @param {File} imageFile - Image file to embed into
 * @param {string} text - Text to embed
 * @param {string} password - Password for encryption (empty string for no encryption)
 * @returns {Promise<{success: boolean, outputImage: Blob, fileName: string, error?: string}>}
 */
export async function embedLsbText(imageFile, text, password = "") {
  try {
    const preparedImage = await prepareImage(imageFile)
    const encoder = new TextEncoder()
    const textData = encoder.encode(text)
    const encrypted = await encryptData(textData, password)

    // Format: [4 byte size][encrypted data]
    const sizeBytes = packBigEndian(encrypted.length)
    const payload = concatArrays(sizeBytes, encrypted)

    const outputBlob = await encodeLSB(preparedImage, payload)

    return {
      success: true,
      outputImage: outputBlob,
      fileName: "output.png",
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Embed file into image using LSB steganography
 * @param {File} imageFile - Image file to embed into
 * @param {File} file - File to embed
 * @param {string} password - Password for encryption (empty string for no encryption)
 * @returns {Promise<{success: boolean, outputImage: Blob, fileName: string, error?: string}>}
 */
export async function embedLsbFile(imageFile, file, password = "") {
  try {
    const preparedImage = await prepareImage(imageFile)
    const fileData = await file.arrayBuffer()
    const encrypted = await encryptData(new Uint8Array(fileData), password)

    // Format: [4 byte filename_len][filename][4 byte encrypted_size][encrypted data]
    const encoder = new TextEncoder()
    const filenameBytes = encoder.encode(file.name)
    const filenameLenBytes = packBigEndian(filenameBytes.length)
    const encryptedSizeBytes = packBigEndian(encrypted.length)

    const payload = concatArrays(filenameLenBytes, filenameBytes, encryptedSizeBytes, encrypted)

    const outputBlob = await encodeLSB(preparedImage, payload)

    return {
      success: true,
      outputImage: outputBlob,
      fileName: "output.png",
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Extract hidden data from image using LSB steganography
 * @param {File} imageFile - Image file to extract from
 * @param {string} password - Password for decryption (empty string if no encryption)
 * @returns {Promise<{type: string, content?: string, filename?: string, fileBlob?: Blob, error?: string}>}
 */
export async function extractLsb(imageFile, password = "") {
  try {
    const preparedImage = await prepareImage(imageFile)
    const raw = await decodeLSB(preparedImage)

    // Try to detect if it's a file or text by attempting file format first
    try {
      // Try file format: [4 byte filename_len][filename][4 byte size][data]
      if (raw.length >= 8) {
        const nameLenValue = unpackBigEndian(raw, 0)

        // Sanity check: filename length should be reasonable
        if (nameLenValue > 0 && nameLenValue < 1000 && nameLenValue + 8 <= raw.length) {
          const filename = new TextDecoder().decode(raw.slice(4, 4 + nameLenValue))
          const sizeValue = unpackBigEndian(raw, 4 + nameLenValue)

          if (sizeValue > 0 && sizeValue + 8 + nameLenValue <= raw.length) {
            const encrypted = raw.slice(8 + nameLenValue, 8 + nameLenValue + sizeValue)
            const data = await decryptData(encrypted, password)

            return {
              type: "file",
              filename,
              fileBlob: new Blob([data]),
            }
          }
        }
      }
    } catch (e) {
      // Fall through to text format
    }

    // Text format: [4 byte size][data]
    if (raw.length >= 4) {
      const size = unpackBigEndian(raw, 0)
      if (size > 0 && size + 4 <= raw.length) {
        const encrypted = raw.slice(4, 4 + size)
        const data = await decryptData(encrypted, password)
        const content = new TextDecoder("utf-8").decode(data)

        return {
          type: "text",
          content,
        }
      }
    }

    throw new Error("Invalid or corrupted LSB data")
  } catch (error) {
    return {
      type: "error",
      error: error.message,
    }
  }
}
