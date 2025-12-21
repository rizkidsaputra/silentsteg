"use client"

import Navbar from "@/components/navbar"
import { Lock, Code2, ImageIcon, FileText, ArrowRight, Shield, Zap, Eye } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Advanced Steganography Tools</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance mb-4 sm:mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent px-4">
                Hide Data in Plain Sight
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground-muted text-balance leading-relaxed px-4">
                Embed sensitive information into images using cutting-edge steganography techniques. Military-grade
                encryption meets invisible data storage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-12 sm:mb-16">
              <div className="group p-5 sm:p-6 bg-surface-secondary border border-border rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">Invisible Storage</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  Hide data within images without any visible changes. Your secrets remain completely undetectable.
                </p>
              </div>

              <div className="group p-5 sm:p-6 bg-surface-secondary border border-border rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">Military Encryption</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  AES-256 encryption ensures your embedded data stays protected even if discovered.
                </p>
              </div>

              <div className="group p-5 sm:p-6 bg-surface-secondary border border-border rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">Browser-Based</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  All processing happens locally in your browser. Your files never leave your device.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Methods Section */}
        <div className="bg-surface-tertiary border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Three Powerful Methods</h2>
              <p className="text-foreground-muted text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
                Choose the steganography technique that best fits your security needs and use case.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              <Link href="/embed?method=EXIF" className="block group">
                <div className="h-full p-6 sm:p-7 lg:p-8 bg-background border-2 border-border rounded-xl hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3">EXIF Metadata</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-3 sm:mb-4">
                    Embed data directly into image EXIF tags. Survives format conversions and is widely compatible.
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              <Link href="/embed?method=LSB" className="block group">
                <div className="h-full p-6 sm:p-7 lg:p-8 bg-background border-2 border-border rounded-xl hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
                    <Code2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3">LSB Encoding</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-3 sm:mb-4">
                    Modify least significant bits of pixel data. High capacity storage with military-grade encryption.
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              <Link href="/embed?method=PNG_METADATA" className="block group sm:col-span-2 lg:col-span-1">
                <div className="h-full p-6 sm:p-7 lg:p-8 bg-background border-2 border-border rounded-xl hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3">PNG Metadata</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-3 sm:mb-4">
                    Store data in PNG text chunks. Preserves image quality perfectly and highly reliable.
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 sm:p-10 lg:p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Hide Your Data?</h2>
              <p className="text-foreground-muted text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Start embedding sensitive information into images right now. No registration required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto sm:max-w-none">
                <Link
                  href="/embed"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Embed Data
                </Link>
                <Link
                  href="/extract"
                  className="px-6 py-3 bg-surface-secondary border border-border text-foreground rounded-lg font-medium hover:border-primary/50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Extract Data
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
