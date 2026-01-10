import piexif from "piexifjs";

/**
 * EXIF field mapping
 */
const EXIF_FIELDS = {
  UserComment: { ifd: "Exif", tag: piexif.ExifIFD.UserComment },
  ImageDescription: { ifd: "0th", tag: piexif.ImageIFD.ImageDescription },
  Artist: { ifd: "0th", tag: piexif.ImageIFD.Artist },
  Copyright: { ifd: "0th", tag: piexif.ImageIFD.Copyright },
};

/* ---------------------------------------------------------------------
   HELPERS
------------------------------------------------------------------------ */

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const bstr = atob(data);
  const arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) arr[i] = bstr.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Decode generic EXIF value (STRING or BYTE ARRAY)
 */
function decodeExifBytes(value) {
  if (!value) return null;

  if (typeof value === "string") return value;

  const bytes =
    Array.isArray(value) ? new Uint8Array(value)
    : value instanceof Uint8Array ? value
    : null;

  if (!bytes) return null;

  return new TextDecoder().decode(bytes);
}

/**
 * Decode EXIF UserComment according to spec
 * Handles ASCII / UNICODE prefix correctly
 */
function decodeUserComment(raw) {
  if (!raw) return null;

  // CASE 1: piexifjs already returns STRING
  if (typeof raw === "string") {
    const asciiPrefix = "ASCII\u0000\u0000\u0000";
    const unicodePrefix = "UNICODE\u0000";

    if (raw.startsWith(asciiPrefix)) {
      return raw.slice(asciiPrefix.length);
    }

    if (raw.startsWith(unicodePrefix)) {
      return raw.slice(unicodePrefix.length);
    }

    return raw;
  }

  // CASE 2: BYTE ARRAY
  const bytes =
    Array.isArray(raw) ? new Uint8Array(raw)
    : raw instanceof Uint8Array ? raw
    : null;

  if (!bytes) return null;

  // Detect ASCII prefix
  const asciiPrefixBytes = new TextEncoder().encode("ASCII\0\0\0");
  const unicodePrefixBytes = new TextEncoder().encode("UNICODE\0");

  const startsWith = (buf, prefix) =>
    prefix.every((v, i) => buf[i] === v);

  if (bytes.length >= asciiPrefixBytes.length &&
      startsWith(bytes, asciiPrefixBytes)) {
    return new TextDecoder("utf-8").decode(
      bytes.slice(asciiPrefixBytes.length)
    );
  }

  if (bytes.length >= unicodePrefixBytes.length &&
      startsWith(bytes, unicodePrefixBytes)) {
    return new TextDecoder("utf-16le").decode(
      bytes.slice(unicodePrefixBytes.length)
    );
  }

  // Fallback
  return new TextDecoder().decode(bytes);
}



/* ---------------------------------------------------------------------
   EMBED
------------------------------------------------------------------------ */

export async function embedExif(imageFile, message, field = "UserComment") {
  if (!EXIF_FIELDS[field]) {
    throw new Error(`Field '${field}' tidak tersedia.`);
  }

  const dataUrl = await readFileAsDataUrl(imageFile);

  let exifDict;
  try {
    exifDict = piexif.load(dataUrl);
  } catch {
    exifDict = { "0th": {}, Exif: {}, GPS: {}, Interop: {}, "1st": {} };
  }

  const { ifd, tag } = EXIF_FIELDS[field];
  if (!exifDict[ifd]) exifDict[ifd] = {};

  // UserComment MUST be byte array with encoding prefix
  if (field === "UserComment") {
    const prefix = new TextEncoder().encode("ASCII\0\0\0");
    const encoded = new TextEncoder().encode(message);
    const merged = new Uint8Array([...prefix, ...encoded]);

    exifDict[ifd][tag] = Array.from(merged);
  } else {
    // Other EXIF fields are proper strings
    exifDict[ifd][tag] = message;
  }

  const exifBytes = piexif.dump(exifDict);
  const newDataUrl = piexif.insert(exifBytes, dataUrl);

  return dataUrlToBlob(newDataUrl);
}

/* ---------------------------------------------------------------------
   EXTRACT
------------------------------------------------------------------------ */

export async function extractExif(imageFile) {
  const dataUrl = await readFileAsDataUrl(imageFile);

  let exifDict;
  try {
    exifDict = piexif.load(dataUrl);
  } catch {
    return {
      UserComment: null,
      ImageDescription: null,
      Artist: null,
      Copyright: null,
    };
  }

  let userComment = null;
  const rawUC = exifDict["Exif"]?.[piexif.ExifIFD.UserComment];

  if (Array.isArray(rawUC) && rawUC.length >= 8) {
    userComment = rawUC
      .slice(8)
      .map(b => String.fromCharCode(b))
      .join("");
  } else if (typeof rawUC === "string") {
    userComment = rawUC.replace(/^ASCII\0\0\0/, "");
  }

  return {
    UserComment: userComment,
    ImageDescription:
      typeof exifDict["0th"]?.[piexif.ImageIFD.ImageDescription] === "string"
        ? exifDict["0th"][piexif.ImageIFD.ImageDescription]
        : null,
    Artist:
      typeof exifDict["0th"]?.[piexif.ImageIFD.Artist] === "string"
        ? exifDict["0th"][piexif.ImageIFD.Artist]
        : null,
    Copyright:
      typeof exifDict["0th"]?.[piexif.ImageIFD.Copyright] === "string"
        ? exifDict["0th"][piexif.ImageIFD.Copyright]
        : null,
  };
}
