"use client"

interface MethodSelectorProps {
  methods: string[]
  selected: string
  onSelect: (method: string) => void
}

export default function MethodSelector({ methods, selected, onSelect }: MethodSelectorProps) {
  const methodIcons: Record<string, string> = {
    EXIF: "📸",
    LSB: "💾",
    PNG_METADATA: "📄",
  }

  const methodLabels: Record<string, string> = {
    EXIF: "EXIF Metadata",
    LSB: "LSB Encoding",
    PNG_METADATA: "PNG Text Chunks",
  }

  return (
    <div className="bg-surface-secondary border border-border rounded-lg p-8">
      <h2 className="text-xl font-bold mb-6">Select Embedding Method</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {methods.map((method) => (
          <button
            key={method}
            onClick={() => onSelect(method)}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              selected === method
                ? "border-primary bg-primary/10"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <div className="text-3xl mb-2">{methodIcons[method]}</div>
            <h3 className="font-bold">{methodLabels[method]}</h3>
            <p className="text-xs text-foreground-muted mt-2">
              {method === "EXIF" && "Best for metadata and compatibility"}
              {method === "LSB" && "High capacity, works with any format"}
              {method === "PNG_METADATA" && "Perfect for PNG files"}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
