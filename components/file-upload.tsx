"use client"

import { useRef } from "react"

interface FileUploadProps {
  accept: string
  onFileSelect: (file: File) => void
  selectedFile: File | null
}

export default function FileUpload({ accept, onFileSelect, selectedFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0])
          }
        }}
        className="hidden"
      />

      {selectedFile ? (
        <div className="p-6 bg-background border-2 border-primary/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted mb-1">Selected File</p>
              <p className="font-bold text-primary">{selectedFile.name}</p>
              <p className="text-xs text-foreground-muted mt-2">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
            <div className="text-3xl">✓</div>
          </div>
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
              onFileSelect(null as any)
            }}
            className="mt-4 w-full px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors text-sm font-medium"
          >
            Change File
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-12 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors bg-background flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="text-4xl mb-4">📁</div>
          <p className="font-bold mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-foreground-muted">Image files only</p>
        </button>
      )}
    </div>
  )
}
