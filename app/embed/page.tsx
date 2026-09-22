"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
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
  const [password, setPassword] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const exifFields = ["UserComment", "ImageDescription", "Artist", "Copyright"]
  const pngFields = ["Title", "Author", "Description", "Copyright", "Comment", "Secret"]

  const handleEmbed = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!imageFile) {
      setErrorMessage("Please select an image first.")
      return
    }

    if (!hideContent) {
      setErrorMessage("Please enter text or choose a file to embed.")
      return
    }

    setIsProcessing(true)
    try {
      await embedContent(method, imageFile, hideContent, selectedField, password)
      setSuccessMessage("Done! Your stego image has been downloaded.")
    } catch (error) {
      console.error("Embed error:", error)
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while embedding your data. Please try a different image or content.",
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
            Embed Data
          </h1>
          <p className="text-sm sm:text-base text-foreground-muted mb-8 sm:mb-12">
            Hide text or files inside an image
          </p>

          <div className="space-y-6 sm:space-y-8">

            {/* Method Selection */}
            <MethodSelector
              methods={["EXIF", "LSB", "PNG_METADATA"]}
              selected={method}
              onSelect={(m) => setMethod(m as EmbedMethod)}
            />

            {/* Step 1 */}
            <div className="bg-surface-secondary border border-border radius-terminal p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                Step 1: Select Image
              </h2>
              <FileUpload
                accept="image/*"
                onFileSelect={setImageFile}
                selectedFile={imageFile}
              />
            </div>

            {/* PNG Metadata */}
            {method === "PNG_METADATA" && (
              <div className="bg-surface-secondary border border-border radius-terminal p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                  Metadata Field
                </h2>
                <div role="radiogroup" aria-label="PNG metadata field" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {pngFields.map((field) => (
                    <button
                      key={field}
                      type="button"
                      role="radio"
                      aria-checked={selectedField === field}
                      onClick={() => setSelectedField(field)}
                      className={`min-h-[44px] px-4 py-3 radius-terminal font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
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

            {/* EXIF */}
            {method === "EXIF" && (
              <div className="bg-surface-secondary border border-border radius-terminal p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                  EXIF Field
                </h2>
                <div role="radiogroup" aria-label="EXIF field" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {exifFields.map((field) => (
                    <button
                      key={field}
                      type="button"
                      role="radio"
                      aria-checked={selectedField === field}
                      onClick={() => setSelectedField(field)}
                      className={`min-h-[44px] px-4 py-3 radius-terminal font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
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

            {/* Step 2 */}
            <div className="bg-surface-secondary border border-border radius-terminal p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                Step 2: Add Content to Hide
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="embed-text" className="block text-sm font-medium mb-2">
                    Text to embed
                  </label>
                  <textarea
                    id="embed-text"
                    value={typeof hideContent === "string" ? hideContent : ""}
                    onChange={(e) => setHideContent(e.target.value)}
                    placeholder="Enter text to embed..."
                    className="
                      w-full
                      h-28 sm:h-32 lg:h-40
                      bg-background
                      border border-border
                      radius-terminal
                      p-3 sm:p-4
                      text-sm sm:text-base
                      focus-visible:outline-none
                      focus-visible:border-primary
                      focus-visible:ring-2
                      focus-visible:ring-primary/40
                    "
                  />
                </div>

                {method === "LSB" && (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs sm:text-sm text-foreground-muted">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <label className="block min-h-[44px] px-4 py-3 bg-surface border border-primary/30 radius-terminal cursor-pointer hover:bg-surface text-primary text-center font-medium transition-colors focus-within:ring-2 focus-within:ring-primary">
                      {typeof hideContent !== "string" && hideContent ? (
                        <>File selected: {hideContent.name}</>
                      ) : (
                        <>Upload File to Embed</>
                      )}
                      <input
                        type="file"
                        aria-label="Upload file to embed"
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setHideContent(e.target.files[0])
                          }
                        }}
                      />
                    </label>

                    <div>
                      <label htmlFor="embed-password" className="block text-sm font-medium mb-2">
                        Encryption password <span className="text-foreground-muted font-normal">(optional)</span>
                      </label>
                      <input
                        id="embed-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave empty for no encryption"
                        className="w-full bg-background border border-border radius-terminal p-3 text-sm sm:text-base focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                      />
                      <p className="mt-2 text-xs sm:text-sm text-warning">
                        {password
                          ? "This data will be encrypted (AES-GCM). You'll need the exact same password to extract it later."
                          : "Warning: no password set, so the hidden data will be stored as plain text. Anyone who extracts it will be able to read it."}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <div role="alert" aria-live="assertive" className="flex items-start gap-3 bg-destructive/10 border border-destructive radius-terminal p-3 sm:p-4 text-sm sm:text-base">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-destructive font-medium">{errorMessage}</p>
              </div>
            )}

            {/* Success */}
            {successMessage && !errorMessage && (
              <div role="status" aria-live="polite" className="flex items-start gap-3 bg-success/10 border border-success radius-terminal p-3 sm:p-4 text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-success font-medium">{successMessage}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleEmbed}
                disabled={isProcessing}
                aria-busy={isProcessing}
                className="w-full sm:flex-1 min-h-[44px] px-6 py-3 bg-primary text-background font-mono font-bold radius-terminal hover:bg-primary/90 glow-primary-sm hover:glow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
              >
                {isProcessing ? "Processing…" : "Embed & Download"}
              </button>

              <button
                onClick={() => {
                  setImageFile(null)
                  setHideContent("")
                  setPassword("")
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className="w-full sm:flex-1 min-h-[44px] px-6 py-3 bg-surface-secondary border border-border text-foreground font-bold radius-terminal hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
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

// Steganography Logic
async function embedContent(
  method: string,
  imageFile: File,
  content: string | File,
  field: string,
  password: string
) {
  if (method === "EXIF") {
    const resultBlob = await embedExif(imageFile, content as string, field)
    downloadBlob(resultBlob, `stego_${imageFile.name}`)
  } else if (method === "LSB") {
    if (typeof content === "string") {
      const result = await embedLsbText(imageFile, content, password)
      if (result.success) {
        downloadBlob(result.outputImage, result.fileName)
      } else {
        throw new Error(result.error || "LSB embedding failed")
      }
    } else {
      const result = await embedLsbFile(imageFile, content, password)
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
    throw new Error(`${method} method not implemented`)
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
