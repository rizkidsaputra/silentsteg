"use client"

import Navbar from "@/components/navbar"
import { ImageIcon, Code2, FileText } from "lucide-react"

export default function About() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="font-mono prompt-heading text-4xl font-bold mb-2">About Steganography</h1>
          <p className="text-foreground-muted mb-12">Understanding the art and science of hidden data</p>

          <div className="space-y-12">
            {/* What is Steganography */}
            <section className="bg-surface-secondary border border-border radius-terminal p-8">
              <h2 className="font-mono text-2xl font-bold mb-4 text-primary">What is Steganography?</h2>
              <p className="text-foreground-muted mb-4">
                Steganography is the practice of concealing messages or data within other non-secret content. Unlike
                cryptography, which makes data unreadable, steganography hides the existence of the data altogether.
              </p>
              <p className="text-foreground-muted">
                The term comes from Greek: "steganos" (covered) and "graphia" (writing). It has been used for centuries,
                from invisible ink to modern digital techniques, to communicate secretly without drawing attention.
              </p>
            </section>

            {/* Method Details */}
            <section>
              <h2 className="font-mono text-2xl font-bold mb-6">Embedding Methods</h2>

              <div className="space-y-6">
                {/* EXIF Method */}
                <div className="bg-surface-secondary border border-border radius-terminal p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <ImageIcon className="w-8 h-8 text-primary shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                      <h3 className="font-mono text-xl font-bold mb-2">EXIF Metadata</h3>
                      <p className="text-foreground-muted text-sm">
                        EXIF (Exchangeable Image File Format) stores metadata about images including camera settings,
                        GPS coordinates, and timestamps.
                      </p>
                    </div>
                  </div>
                  <div className="bg-background p-4 radius-terminal border border-border">
                    <p className="text-sm text-foreground-muted font-mono">
                      <strong className="text-foreground">Advantages:</strong> Invisible to typical viewers, survives
                      many format conversions, large storage capacity for metadata
                      <br />
                      <strong className="text-foreground">Disadvantages:</strong> Often stripped by image processing
                      software, limited to text
                      <br />
                      <strong className="text-foreground">Capacity:</strong> Variable, typically 1-10 KB depending on
                      metadata
                    </p>
                  </div>
                </div>

                {/* LSB Method */}
                <div className="bg-surface-secondary border border-border radius-terminal p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <Code2 className="w-8 h-8 text-primary shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                      <h3 className="font-mono text-xl font-bold mb-2">LSB (Least Significant Bit) Encoding</h3>
                      <p className="text-foreground-muted text-sm">
                        LSB encoding works by modifying the least significant bit of pixel color values. Since humans
                        can't perceive such minimal changes, data can be hidden imperceptibly.
                      </p>
                    </div>
                  </div>
                  <div className="bg-background p-4 radius-terminal border border-border">
                    <p className="text-sm text-foreground-muted font-mono">
                      <strong className="text-foreground">Advantages:</strong> High capacity, works with any image
                      format, imperceptible changes
                      <br />
                      <strong className="text-foreground">Disadvantages:</strong> Vulnerable to filtering and
                      compression, lost during image resizing
                      <br />
                      <strong className="text-foreground">Capacity:</strong> Up to 1 bit per pixel (large images can
                      hold MB of data)
                    </p>
                  </div>
                </div>

                {/* PNG Metadata Method */}
                <div className="bg-surface-secondary border border-border radius-terminal p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <FileText className="w-8 h-8 text-primary shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                      <h3 className="font-mono text-xl font-bold mb-2">PNG Text Chunks</h3>
                      <p className="text-foreground-muted text-sm">
                        PNG format supports ancillary text chunks (tEXt, zTXt) that can store arbitrary text data. This
                        method is PNG-specific and very reliable.
                      </p>
                    </div>
                  </div>
                  <div className="bg-background p-4 radius-terminal border border-border">
                    <p className="text-sm text-foreground-muted font-mono">
                      <strong className="text-foreground">Advantages:</strong> Official PNG feature, preserves image
                      quality perfectly, reliable
                      <br />
                      <strong className="text-foreground">Disadvantages:</strong> Only works with PNG format, may be
                      stripped by PNG editors
                      <br />
                      <strong className="text-foreground">Capacity:</strong> Up to 2GB per chunk (practical limits much
                      lower)
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Security Note */}
            <section className="bg-surface-secondary border border-border radius-terminal p-8">
              <h2 className="font-mono text-2xl font-bold mb-4 text-warning">Security Considerations</h2>
              <p className="text-foreground-muted mb-4">
                Steganography should not be relied upon as the sole means of protecting sensitive data. For maximum
                security:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground-muted">
                <li>Combine steganography with encryption for additional security</li>
                <li>Be aware that LSB encoding can be detected through statistical analysis</li>
                <li>Avoid using steganography over insecure channels without additional encryption</li>
                <li>Test your images before sharing to ensure the embedded data survives</li>
                <li>Remember that image processing may destroy hidden data</li>
              </ul>
            </section>
            
            {/* Privacy Policy */}
            <section id="privacy" className="bg-surface-secondary border border-border radius-terminal p-8">
              <h2 className="font-mono text-2xl font-bold mb-4">Privacy Policy</h2>
              <p className="text-foreground-muted mb-4">
                This website does not store any photos you upload. All image processing is performed locally in your
                browser; files are not sent to or retained on our servers. Any resulting files are only saved if you
                explicitly download them.
              </p>
              <p className="text-foreground-muted">
                If you have privacy concerns, avoid uploading images containing sensitive information and delete
                downloaded files from your device when they are no longer needed.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
