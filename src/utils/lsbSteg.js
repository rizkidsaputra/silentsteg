// ===================== Constants =====================

// Payload envelope: [FORMAT_VERSION(1)][TYPE(1)][... type-specific ...]
// TYPE_TEXT body:   [4-byte encEnvelope length][encEnvelope]
// TYPE_FILE body:   [4-byte filename length][filename][4-byte encEnvelope length][encEnvelope]
//
// encEnvelope (produced by encryptData / consumed by decryptData):
//   ENC_NONE:            [0x00][plaintext]
//   ENC_AES_GCM_PBKDF2:  [0x01][salt(16)][iv(12)][ciphertext+authTag]
const FORMAT_VERSION = 2
const TYPE_TEXT = 0
const TYPE_FILE = 1

const ENC_NONE = 0x00
const ENC_AES_GCM_PBKDF2 = 0x01

const SALT_LENGTH = 16
const IV_LENGTH = 12 // recommended nonce size for AES-GCM
const PBKDF2_ITERATIONS = 210000

// ===================== Helper Functions =====================

/**
 * Derive an AES-GCM key from a password using PBKDF2 (salted, iterated).
 * Replaces the old unsalted single-round SHA-256 key derivation, which was
 * vulnerable to rainbow-table lookups and fast brute-forcing.
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveKey",
  ])

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

/**
 * Encrypt data using AES-GCM (authenticated encryption) with a PBKDF2-derived key.
 * AES-CFB (the previous scheme) is not part of the Web Crypto API and always
 * threw a NotSupportedError at runtime whenever a password was supplied - the
 * encryption feature was effectively dead code. AES-GCM also provides a built-in
 * authentication tag, so tampered/corrupted ciphertext is detected instead of
 * silently decrypting to garbage.
 *
 * Returns the envelope: [encFlag(1)][salt(16) + iv(12) if encrypted][ciphertext]
 */
async function encryptData(data, password) {
  if (!password) {
    return concatArrays(new Uint8Array([ENC_NONE]), data)
  }

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(password, salt)

  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data))

  return concatArrays(new Uint8Array([ENC_AES_GCM_PBKDF2]), salt, iv, encrypted)
}

/**
 * Decrypt an envelope produced by encryptData. Throws a user-facing error
 * (instead of returning corrupted bytes) when the password is wrong, the
 * envelope's encryption state doesn't match what the caller expects, or the
 * data has been tampered with (GCM authentication failure).
 */
async function decryptData(envelope, password) {
  if (!envelope || envelope.length < 1) {
    throw new Error("Data terenkripsi tidak valid atau rusak.")
  }

  const flag = envelope[0]
  const rest = envelope.slice(1)

  if (flag === ENC_NONE) {
    if (password) {
      throw new Error("Data ini tidak dienkripsi. Kosongkan password untuk mengekstraknya.")
    }
    return rest
  }

  if (flag === ENC_AES_GCM_PBKDF2) {
    if (!password) {
      throw new Error("Data ini dienkripsi dengan password. Masukkan password untuk mengekstraknya.")
    }

    if (rest.length < SALT_LENGTH + IV_LENGTH) {
      throw new Error("Data terenkripsi tidak valid atau rusak.")
    }

    const salt = rest.slice(0, SALT_LENGTH)
    const iv = rest.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const ciphertext = rest.slice(SALT_LENGTH + IV_LENGTH)
    const key = await deriveKey(password, salt)

    try {
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext)
      return new Uint8Array(decrypted)
    } catch (e) {
      throw new Error("Gagal mendekripsi data. Password salah atau data rusak.")
    }
  }

  throw new Error("Format enkripsi tidak dikenali.")
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

  // Calculate capacity: each pixel has 3 channels, each channel stores 1 bit.
  // Floored to whole bytes - decodeLSB drops any trailing partial byte, so the
  // true usable capacity is never fractional.
  const maxCapacity = Math.floor((width * height * 3) / 8)
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
    const envelope = await encryptData(textData, password)

    // Format: [version][type=TEXT][4-byte envelope size][envelope]
    const payload = concatArrays(
      new Uint8Array([FORMAT_VERSION, TYPE_TEXT]),
      packBigEndian(envelope.length),
      envelope,
    )

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
    const envelope = await encryptData(new Uint8Array(fileData), password)

    // Format: [version][type=FILE][4-byte filename_len][filename][4-byte envelope size][envelope]
    const encoder = new TextEncoder()
    const filenameBytes = encoder.encode(file.name)

    const payload = concatArrays(
      new Uint8Array([FORMAT_VERSION, TYPE_FILE]),
      packBigEndian(filenameBytes.length),
      filenameBytes,
      packBigEndian(envelope.length),
      envelope,
    )

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
 * Extract hidden data from image using LSB steganography.
 *
 * The previous implementation guessed whether the payload was a "file" or
 * "text" by speculatively parsing it as a file and checking whether the
 * decoded filename length looked plausible (< 1000). That heuristic could
 * misfire (e.g. it would throw on any image with no embedded data, and could
 * in principle misclassify a text payload whose first bytes happened to look
 * like a valid filename-length header). The payload now carries an explicit
 * type byte, so no guessing is required.
 *
 * @param {File} imageFile - Image file to extract from
 * @param {string} password - Password for decryption (empty string if no encryption)
 * @returns {Promise<{type: string, content?: string, filename?: string, fileBlob?: Blob, error?: string}>}
 */
export async function extractLsb(imageFile, password = "") {
  try {
    const preparedImage = await prepareImage(imageFile)
    const raw = await decodeLSB(preparedImage)

    if (raw.length < 2) {
      throw new Error("Tidak ada data tersembunyi yang ditemukan pada gambar ini.")
    }

    const version = raw[0]
    const type = raw[1]

    if (version !== FORMAT_VERSION) {
      throw new Error(
        "Tidak ada data tersembunyi yang valid ditemukan (format tidak dikenali). Pastikan gambar ini memang berisi data LSB.",
      )
    }

    let offset = 2

    if (type === TYPE_TEXT) {
      if (offset + 4 > raw.length) throw new Error("Data rusak atau tidak lengkap.")
      const size = unpackBigEndian(raw, offset)
      offset += 4

      if (size < 0 || offset + size > raw.length) {
        throw new Error("Data rusak atau tidak lengkap.")
      }

      const envelope = raw.slice(offset, offset + size)
      const data = await decryptData(envelope, password)
      const content = new TextDecoder("utf-8").decode(data)

      return { type: "text", content }
    }

    if (type === TYPE_FILE) {
      if (offset + 4 > raw.length) throw new Error("Data rusak atau tidak lengkap.")
      const nameLen = unpackBigEndian(raw, offset)
      offset += 4

      if (nameLen < 0 || offset + nameLen > raw.length) {
        throw new Error("Data rusak atau tidak lengkap.")
      }
      const filename = new TextDecoder().decode(raw.slice(offset, offset + nameLen))
      offset += nameLen

      if (offset + 4 > raw.length) throw new Error("Data rusak atau tidak lengkap.")
      const size = unpackBigEndian(raw, offset)
      offset += 4

      if (size < 0 || offset + size > raw.length) {
        throw new Error("Data rusak atau tidak lengkap.")
      }

      const envelope = raw.slice(offset, offset + size)
      const data = await decryptData(envelope, password)

      return {
        type: "file",
        filename,
        fileBlob: new Blob([data]),
      }
    }

    throw new Error("Tipe data tersembunyi tidak dikenali.")
  } catch (error) {
    return {
      type: "error",
      error: error.message,
    }
  }
}
