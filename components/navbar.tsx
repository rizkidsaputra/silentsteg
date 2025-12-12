"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="text-primary">Stego</span>
          <span>Suite</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className={`transition-colors text-sm font-medium ${
              isActive("/dashboard") ? "text-primary" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/embed"
            className={`transition-colors text-sm font-medium ${
              isActive("/embed") ? "text-primary" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Embed
          </Link>
          <Link
            href="/extract"
            className={`transition-colors text-sm font-medium ${
              isActive("/extract") ? "text-primary" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Extract
          </Link>
          <Link
            href="/about"
            className={`transition-colors text-sm font-medium ${
              isActive("/about") ? "text-primary" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  )
}
