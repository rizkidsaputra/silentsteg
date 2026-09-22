"use client"

import type { ComponentType } from "react"
import { ImageIcon, Code2, FileText } from "lucide-react"

interface MethodSelectorProps {
  methods: string[]
  selected: string
  onSelect: (method: string) => void
}

// Same icon-per-method mapping used on the dashboard, so the three
// embedding methods are visually identifiable consistently across the app.
const methodIcons: Record<string, ComponentType<{ className?: string }>> = {
  EXIF: ImageIcon,
  LSB: Code2,
  PNG_METADATA: FileText,
}

const methodLabels: Record<string, string> = {
  EXIF: "EXIF Metadata",
  LSB: "LSB Encoding",
  PNG_METADATA: "PNG Text Chunks",
}

export default function MethodSelector({ methods, selected, onSelect }: MethodSelectorProps) {
  return (
    <fieldset className="bg-surface-secondary border border-border radius-terminal p-4 sm:p-6 lg:p-8">
      <legend className="font-mono text-lg sm:text-xl font-bold mb-4 sm:mb-6 px-0 prompt-heading">
        Select Embedding Method
      </legend>
      <div role="radiogroup" aria-label="Embedding method" className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {methods.map((method) => {
          const Icon = methodIcons[method]
          const isSelected = selected === method
          return (
            <button
              key={method}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(method)}
              className={`min-h-[44px] p-4 sm:p-6 radius-terminal border-2 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isSelected
                  ? "corner-brackets border-primary bg-primary/10 glow-primary-sm"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              <Icon className={`w-6 h-6 sm:w-7 sm:h-7 mb-2 ${isSelected ? "text-primary" : "text-foreground-muted"}`} aria-hidden="true" />
              <h3 className="font-mono font-bold text-sm sm:text-base">{methodLabels[method]}</h3>
              <p className="text-xs text-foreground-muted mt-2">
                {method === "EXIF" && "Best for metadata and compatibility"}
                {method === "LSB" && "High capacity, works with any format"}
                {method === "PNG_METADATA" && "Perfect for PNG files"}
              </p>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
