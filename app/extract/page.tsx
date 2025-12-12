"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import MethodSelector from "@/components/method-selector"
import FileUpload from "@/components/file-upload"
import { extractExif } from "@/src/utils/exifSteg"
import { extractPngMeta } from "@/src/utils/pngMetaSteg"
import { extractLsb } from "@/src/utils/lsbSteg"   // ⬅️ FIX: tambahkan ini

type ExtractMethod = "EXIF" | "LSB" | "PNG_METADATA"

export default function Extract() {
  const [method, setMethod] = useState<ExtractMethod>("EXIF")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [extractedContent, setExtractedContent] = useState<string | null>(null)
  const [extractedFile, setExtractedFile] = useState<{ filename: string; blob: Blob } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [extractedMetadata, setExtractedMetadata] = useState<Record<string, string | null> | null>(null)

  const handleExtract = async () => {
    setErrorMessage(null)
    setExtractedContent(null)
    setExtractedMetadata(null)
    setExtractedFile(null)

    if (!imageFile) {
      setErrorMessage("Please select an image")
      return
    }

    setIsProcessing(true)
    try {
      const result = await extractContent(method, imageFile)

      if (method === "EXIF" || method === "PNG_METADATA") {
        setExtractedMetadata(result as Record<string, string | null>)
      } else if (method === "LSB") {
        // Handle LSB result
        if (typeof result === "string") {
          setExtractedContent(result)
        } else if ("filename" in result && "blob" in result) {
          setExtractedFile(result as { filename: string; blob: Blob })
        }
      }
    } catch (error) {
      console.error("Extract error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Error during extraction")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">Extract Data</h1>
          <p className="text-foreground-muted mb-12">Retrieve hidden data from images</p>

          <div className="space-y-8">

            <MethodSelector
              methods={["EXIF", "LSB", "PNG_METADATA"]}
              selected={method}
              onSelect={(m) => setMethod(m as ExtractMethod)}
            />

            <div className="bg-surface-secondary border border-border rounded-lg p-8">
              <h2 className="text-xl font-bold mb-6">Select Image to Extract From</h2>
              <FileUpload accept="image/*" onFileSelect={setImageFile} selectedFile={imageFile} />
            </div>

            <button
              onClick={handleExtract}
              disabled={isProcessing || !imageFile}
              className="w-full px-6 py-3 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Extracting..." : "Extract Content"}
            </button>

            {errorMessage && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="text-destructive font-medium">{errorMessage}</p>
              </div>
            )}

            {/* Metadata Results */}
            {extractedMetadata && (
              <div className="bg-surface-secondary border border-primary/30 rounded-lg p-8">
                <h2 className="text-xl font-bold mb-6 text-primary">Extracted Metadata</h2>
                <div className="space-y-4">
                  {Object.entries(extractedMetadata).map(([key, value]) => (
                    <div key={key} className="bg-background p-4 rounded-lg border border-border">
                      <p className="text-sm font-semibold text-primary mb-2">{key}</p>
                      {value ? (
                        <p className="text-foreground font-mono text-sm break-words max-h-32 overflow-y-auto">
                          {value}
                        </p>
                      ) : (
                        <p className="text-foreground-muted text-sm italic">No data</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Results */}
            {extractedContent && (
              <div className="bg-surface-secondary border border-primary/30 rounded-lg p-8">
                <h2 className="text-xl font-bold mb-4 text-primary">Extracted Text</h2>
                <div className="bg-background p-4 rounded-lg border border-border mb-4 max-h-64 overflow-y-auto">
                  <p className="text-foreground whitespace-pre-wrap break-words font-mono text-sm">
                    {extractedContent}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(extractedContent)
                    alert("Copied to clipboard!")
                  }}
                  className="w-full px-4 py-2 bg-primary/20 border border-primary text-primary font-bold rounded-lg hover:bg-primary/30 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}

            {/* File Results (LSB file) */}
            {extractedFile && (
              <div className="bg-surface-secondary border border-primary/30 rounded-lg p-8">
                <h2 className="text-xl font-bold text-primary mb-4">Extracted File</h2>
                <p className="font-mono text-sm mb-4">{extractedFile.filename}</p>

                <button
                  className="w-full px-4 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary/90"
                  onClick={() => {
                    const url = URL.createObjectURL(extractedFile.blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = extractedFile.filename
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  Download File
                </button>
              </div>
            )}

            {(extractedContent || extractedMetadata || extractedFile) && (
              <button
                onClick={() => {
                  setImageFile(null)
                  setExtractedContent(null)
                  setExtractedMetadata(null)
                  setExtractedFile(null)
                  setErrorMessage(null)
                }}
                className="w-full px-6 py-3 bg-surface-secondary border border-border text-foreground font-bold rounded-lg hover:border-primary/50 transition-colors"
              >
                Extract Again
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

async function extractContent(method: string, imageFile: File): Promise<any> {
  console.log(`[v0] Extracting using ${method}`)

  if (method === "EXIF") {
    return await extractExif(imageFile)

  } else if (method === "PNG_METADATA") {
    const result = await extractPngMeta(imageFile)
    return result.metadata

  } else if (method === "LSB") {
    const result = await extractLsb(imageFile)

    if (result.type === "text") {
      return result.content
    }

    if (result.type === "file") {
      return { filename: result.filename, blob: result.fileBlob }
    }

    throw new Error(result.error || "LSB extraction failed")
  }

  throw new Error(`${method} method not yet implemented`)
}
