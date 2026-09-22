"use client"

import { useState } from "react"
import Link from "next/link"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">

          {/* Logo / Title */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-base sm:text-lg font-bold tracking-tight hover:text-primary transition-colors"
          >
            <span
              className="grid grid-cols-2 grid-rows-2 gap-[2px] w-3.5 h-3.5 glow-primary-sm"
              aria-hidden="true"
            >
              <span className="bg-primary" />
              <span className="bg-primary/30" />
              <span className="bg-primary/30" />
              <span className="bg-primary" />
            </span>
            silentsteg
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/embed">Embed</NavLink>
            <NavLink href="/extract">Extract</NavLink>
            <NavLink href="/about">About</NavLink>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center radius-terminal border border-border p-2 min-w-[44px] min-h-[44px] hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div id="mobile-nav-menu" className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-2">
            <MobileNavLink href="/embed" onClick={() => setOpen(false)}>
              Embed
            </MobileNavLink>
            <MobileNavLink href="/extract" onClick={() => setOpen(false)}>
              Extract
            </MobileNavLink>
            <MobileNavLink href="/about" onClick={() => setOpen(false)}>
              About
            </MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-mono text-sm font-medium text-foreground-muted hover:text-primary transition-colors"
    >
      {children}
    </Link>
  )
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block radius-terminal px-4 py-3 font-mono text-sm font-medium text-foreground hover:bg-surface-secondary transition-colors"
    >
      {children}
    </Link>
  )
}
