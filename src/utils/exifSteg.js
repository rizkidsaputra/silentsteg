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

function decodeExifBytes(value) {
  if (!value) return null;

  // Already string
  if (typeof value === "string") return value;

  // Byte array (piexifjs format)
  if (Array.isArray(value)) {
    return new TextDecoder().decode(new Uint8Array(value));
  }

  // Uint8Array
  if (value instanceof Uint8Array) {
    return new TextDecoder().decode(value);
  }

  return null;
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

  // ✔ FIX: STRING untuk semua field kecuali UserComment
  if (field === "UserComment") {
    const prefix = new TextEncoder().encode("ASCII\0\0\0");
    const encoded = new TextEncoder().encode(message);
    const merged = new Uint8Array([...prefix, ...encoded]);

    exifDict[ifd][tag] = Array.from(merged); // byte array
  } else {
    exifDict[ifd][tag] = message; // STRING (fix utama!)
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

  const result = {
    UserComment: null,
    ImageDescription: null,
    Artist: null,
    Copyright: null,
  };

  for (const [name, { ifd, tag }] of Object.entries(EXIF_FIELDS)) {
    if (!exifDict[ifd] || exifDict[ifd][tag] == null) continue;

    let value = exifDict[ifd][tag];

    // Decode byte arrays
    value = decodeExifBytes(value);

    if (!value) continue;

    // Remove ASCII prefix from UserComment
    if (name === "UserComment") {
      const prefix = "ASCII\u0000\u0000\u0000";
      if (value.startsWith(prefix)) value = value.slice(prefix.length);
    }

    result[name] = value;
  }

  return result;
}
