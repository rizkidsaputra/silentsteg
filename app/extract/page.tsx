"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import Navbar from "@/components/navbar"
import MethodSelector from "@/components/method-selector"
import FileUpload from "@/components/file-upload"
import { extractExif } from "@/src/utils/exifSteg"
import { extractPngMeta } from "@/src/utils/pngMetaSteg"
import { extractLsb } from "@/src/utils/lsbSteg"

type ExtractMethod = "EXIF" | "LSB" | "PNG_METADATA"

export default function Extract() {
  const [method, setMethod] = useState<ExtractMethod>("EXIF")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [extractedContent, setExtractedContent] = useState<string | null>(null)
  const [extractedFile, setExtractedFile] =
    useState<{ filename: string; blob: Blob } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [extractedMetadata, setExtractedMetadata] =
    useState<Record<string, string | null> | null>(null)
  const [copied, setCopied] = useState(false)

  const handleExtract = async () => {
    setErrorMessage(null)
    setExtractedContent(null)
    setExtractedMetadata(null)
    setExtractedFile(null)

    if (!imageFile) {
      setErrorMessage("Please select an image first.")
      return
    }

    setIsProcessing(true)
    try {
      const result = await extractContent(method, imageFile, password)

      if (method === "EXIF" || method === "PNG_METADATA") {
        setExtractedMetadata(result as Record<string, string | null>)
      } else if (method === "LSB") {
        if (typeof result === "string") {
          setExtractedContent(result)
        } else if ("filename" in result && "blob" in result) {
          setExtractedFile(result)
        }
      }
    } catch (error) {
      console.error("Extract error:", error)
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while extracting data from this image.",
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">

          {/* Header */}
          <h1 className="font-mono prompt-heading text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            Extract Data
          </h1>
          <p className="text-sm sm:text-base text-foreground-muted mb-8 sm:mb-12">
            Retrieve hidden data from images
          </p>

          <div className="space-y-6 sm:space-y-8">

            {/* Method Selector */}
            <MethodSelector
              methods={["EXIF", "LSB", "PNG_METADATA"]}
              selected={method}
              onSelect={(m) => setMethod(m as ExtractMethod)}
            />

            {/* Image Upload */}
            <div className="bg-surface-secondary border border-border radius-terminal p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                Select Image to Extract From
              </h2>
              <FileUpload
                accept="image/*"
                onFileSelect={setImageFile}
                selectedFile={imageFile}
              />
            </div>

            {/* Password (LSB only) */}
            {method === "LSB" && (
              <div className="bg-surface-secondary border border-border radius-terminal p-4 sm:p-6 lg:p-8">
                <label htmlFor="extract-password" className="block text-sm font-medium mb-2">
                  Password <span className="text-foreground-muted font-normal">(leave empty if none was set)</span>
                </label>
                <input
                  id="extract-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password if the data was encrypted"
                  className="w-full bg-background border border-border radius-terminal p-3 text-sm sm:text-base focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
            )}

            {/* Extract Button */}
            <button
              onClick={handleExtract}
              disabled={isProcessing || !imageFile}
              aria-busy={isProcessing}
              className="w-full min-h-[44px] px-6 py-3 bg-primary text-background font-mono font-bold radius-terminal hover:bg-primary/90 glow-primary-sm hover:glow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              {isProcessing ? "Extracting…" : "Extract Content"}
            </button>

            {/* Error */}
            {errorMessage && (
              <div role="alert" aria-live="assertive" className="flex items-start gap-3 bg-destructive/10 border border-destructive radius-terminal p-3 sm:p-4 text-sm sm:text-base">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-destructive font-medium">{errorMessage}</p>
              </div>
            )}

            {/* Metadata Result */}
            {extractedMetadata && (
              <div className="bg-surface-secondary border border-primary/30 radius-terminal p-4 sm:p-6 lg:p-8">
                <h2 className="font-mono text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-primary">
                  Extracted Metadata
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(extractedMetadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-background p-3 sm:p-4 radius-terminal border border-border"
                    >
                      <p className="text-xs sm:text-sm font-semibold text-primary mb-2">
                        {key}
                      </p>
                      {value !== null && value !== "" ? (
                        <p className="text-foreground font-mono text-xs sm:text-sm break-words max-h-32 overflow-y-auto">
                          {value}
                        </p>
                      ) : (
                        <p className="text-foreground-muted text-xs sm:text-sm italic">
                          No data
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Result */}
            {extractedContent && (
              <div className="bg-surface-secondary border border-primary/30 radius-terminal p-4 sm:p-6 lg:p-8">
                <h2 className="font-mono text-lg sm:text-xl font-bold mb-4 text-primary">
                  Extracted Text
                </h2>

                <div className="bg-background p-3 sm:p-4 radius-terminal border border-border mb-4 max-h-64 overflow-y-auto">
                  <p className="text-foreground whitespace-pre-wrap break-words font-mono text-xs sm:text-sm">
                    {extractedContent}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(extractedContent)
                    setCopied(true)
                    window.setTimeout(() => setCopied(false), 2000)
                  }}
                  className="w-full min-h-[44px] px-4 py-2 bg-primary/20 border border-primary text-primary font-bold radius-terminal hover:bg-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                >
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
                <p role="status" aria-live="polite" className="sr-only">
                  {copied ? "Copied to clipboard" : ""}
                </p>
              </div>
            )}

            {/* File Result */}
            {extractedFile && (
              <div className="bg-surface-secondary border border-primary/30 radius-terminal p-4 sm:p-6 lg:p-8">
                <h2 className="font-mono text-lg sm:text-xl font-bold text-primary mb-2">
                  Extracted File
                </h2>
                <p className="font-mono text-xs sm:text-sm mb-4 break-all">
                  {extractedFile.filename}
                </p>

                <button
                  className="w-full min-h-[44px] px-4 py-2 bg-primary text-background font-bold radius-terminal hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
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

            {/* Reset */}
            {(extractedContent || extractedMetadata || extractedFile) && (
              <button
                onClick={() => {
                  setImageFile(null)
                  setPassword("")
                  setExtractedContent(null)
                  setExtractedMetadata(null)
                  setExtractedFile(null)
                  setErrorMessage(null)
                }}
                className="w-full min-h-[44px] px-6 py-3 bg-surface-secondary border border-border text-foreground font-bold radius-terminal hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
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


async function extractContent(method: string, imageFile: File, password: string): Promise<any> {
  if (method === "EXIF") {
    return await extractExif(imageFile)
  }

  if (method === "PNG_METADATA") {
    const result = await extractPngMeta(imageFile)
    return result.metadata
  }

  if (method === "LSB") {
    const result = await extractLsb(imageFile, password)

    if (result.type === "text") return result.content
    if (result.type === "file")
      return { filename: result.filename, blob: result.fileBlob }

    throw new Error(result.error || "LSB extraction failed")
  }

  throw new Error(`${method} method not implemented`)
}
