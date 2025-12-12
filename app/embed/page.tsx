"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import MethodSelector from "@/components/method-selector"
import FileUpload from "@/components/file-upload"
import { embedExif } from "@/src/utils/exifSteg"
import { embedLsbText, embedLsbFile } from "@/src/utils/lsbSteg"
import { embedPngMeta } from "@/src/utils/pngMetaSteg"

type EmbedMethod = "EXIF" | "LSB" | "PNG_METADATA"

export default function Embed() {
  const [method, setMethod] = useState<EmbedMethod>("EXIF")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [hideContent, setHideContent] = useState<File | string>("")
  const [selectedField, setSelectedField] = useState("UserComment")
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const exifFields = ["UserComment", "ImageDescription", "Artist", "Copyright"]
  const pngFields = ["Title", "Author", "Description", "Copyright", "Comment", "Secret"]

  const handleEmbed = async () => {
    setErrorMessage(null)

    if (!imageFile) {
      setErrorMessage("Please select an image")
      return
    }

    if (!hideContent) {
      setErrorMessage("Please enter text to embed")
      return
    }

    setIsProcessing(true)
    try {
      await embedContent(method, imageFile, hideContent, selectedField)
    } catch (error) {
      console.error("Embed error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Error during embedding")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">Embed Data</h1>
          <p className="text-foreground-muted mb-12">Hide text or files inside an image</p>

          <div className="space-y-8">
            {/* Method Selection */}
            <MethodSelector
              methods={["EXIF", "LSB", "PNG_METADATA"]}
              selected={method}
              onSelect={(m) => setMethod(m as EmbedMethod)}
            />

            {/* Upload Section */}
            <div className="bg-surface-secondary border border-border rounded-lg p-8">
              <h2 className="text-xl font-bold mb-6">Step 1: Select Image</h2>
              <FileUpload accept="image/*" onFileSelect={setImageFile} selectedFile={imageFile} />
            </div>

            {method === "PNG_METADATA" && (
              <div className="bg-surface-secondary border border-border rounded-lg p-8">
                <h2 className="text-xl font-bold mb-6">Metadata Field</h2>
                <div className="grid grid-cols-2 gap-3">
                  {pngFields.map((field) => (
                    <button
                      key={field}
                      onClick={() => setSelectedField(field)}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        selectedField === field
                          ? "bg-primary text-background"
                          : "bg-surface border border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === "EXIF" && (
              <div className="bg-surface-secondary border border-border rounded-lg p-8">
                <h2 className="text-xl font-bold mb-6">EXIF Field</h2>
                <div className="grid grid-cols-2 gap-3">
                  {exifFields.map((field) => (
                    <button
                      key={field}
                      onClick={() => setSelectedField(field)}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        selectedField === field
                          ? "bg-primary text-background"
                          : "bg-surface border border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content Input */}
            <div className="bg-surface-secondary border border-border rounded-lg p-8">
              <h2 className="text-xl font-bold mb-6">Step 2: Add Content to Hide</h2>
              <div className="space-y-4">
                <textarea
                  value={typeof hideContent === "string" ? hideContent : ""}
                  onChange={(e) => setHideContent(e.target.value)}
                  placeholder="Enter text to embed..."
                  className="w-full h-32 bg-background border border-border rounded-lg p-4 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                {method !== "EXIF" && method !== "PNG_METADATA" && (
                  <>
                    <div className="flex items-center gap-3 py-4">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-foreground-muted text-sm">or</span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                    <label className="block">
                      <div className="px-4 py-2 bg-surface border border-primary/30 rounded-lg cursor-pointer hover:bg-surface text-primary text-center font-medium transition-colors">
                        Upload File to Embed
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setHideContent(e.target.files[0])
                          }
                        }}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="text-destructive font-medium">{errorMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleEmbed}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? "Processing..." : "Embed & Download"}
              </button>
              <button
                onClick={() => {
                  setImageFile(null)
                  setHideContent("")
                  setErrorMessage(null)
                }}
                className="flex-1 px-6 py-3 bg-surface-secondary border border-border text-foreground font-bold rounded-lg hover:border-primary/50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

async function embedContent(method: string, imageFile: File, content: string | File, field: string) {
  console.log(`[v0] Embedding using ${method}`)

  if (method === "EXIF") {
    const resultBlob = await embedExif(imageFile, content as string, field)
    downloadBlob(resultBlob, `stego_${imageFile.name}`)
  } else if (method === "LSB") {
    if (typeof content === "string") {
      const result = await embedLsbText(imageFile, content, "")
      if (result.success) {
        downloadBlob(result.outputImage, result.fileName)
      } else {
        throw new Error(result.error || "LSB embedding failed")
      }
    } else {
      const result = await embedLsbFile(imageFile, content, "")
      if (result.success) {
        downloadBlob(result.outputImage, result.fileName)
      } else {
        throw new Error(result.error || "LSB embedding failed")
      }
    }
  } else if (method === "PNG_METADATA") {
    const result = await embedPngMeta(imageFile, field, content as string)
    downloadBlob(result.outputImage, result.fileName)
  } else {
    throw new Error(`${method} method not yet implemented`)
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
