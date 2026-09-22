"use client"

import { useId, useRef, useState } from "react"
import { UploadCloud, FileCheck2, X } from "lucide-react"

interface FileUploadProps {
  accept: string
  onFileSelect: (file: File) => void
  selectedFile: File | null
  label?: string
}

export default function FileUpload({ accept, onFileSelect, selectedFile, label = "file" }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]) {
      onFileSelect(files[0])
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={accept}
        aria-label={`Upload ${label}`}
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
      />

      {selectedFile ? (
        <div className="p-4 sm:p-6 bg-background border-2 border-primary/30 radius-terminal glow-primary-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xs sm:text-sm text-foreground-muted mb-1">selected_file:</p>
              <p className="font-mono font-bold text-primary text-sm sm:text-base break-all">{selectedFile.name}</p>
              <p className="font-mono text-xs text-foreground-muted mt-2">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
            <FileCheck2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
              onFileSelect(null as any)
            }}
            className="mt-4 w-full min-h-[44px] px-4 py-2 bg-surface border border-border radius-terminal hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Change file
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={`corner-brackets w-full min-h-[176px] p-8 sm:p-12 border-2 border-dashed radius-terminal transition-all bg-background flex flex-col items-center justify-center cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background ${
            isDragging ? "border-primary bg-primary/5 glow-primary-sm" : "border-border hover:border-primary/50"
          }`}
        >
          <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 text-foreground-muted" aria-hidden="true" />
          <p className="font-mono font-bold mb-1 text-sm sm:text-base text-center">Click to upload or drag and drop</p>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="format-chip">.PNG</span>
            <span className="format-chip">.JPG</span>
            <span className="format-chip">.BMP</span>
          </div>
        </label>
      )}
    </div>
  )
}
