import Link from "next/link"
import { Github, Shield } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-tertiary">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg">SilentSteg</span>
            </div>
            <p className="text-sm text-foreground-muted leading-relaxed max-w-md">
              Advanced steganography tools for hiding sensitive data in plain sight. All processing happens locally in
              your browser for maximum security.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground-muted">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-foreground-muted hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/embed" className="text-sm text-foreground-muted hover:text-primary transition-colors">
                  Embed Data
                </Link>
              </li>
              <li>
                <Link href="/extract" className="text-sm text-foreground-muted hover:text-primary transition-colors">
                  Extract Data
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-foreground-muted hover:text-primary transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground-muted">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about#methods"
                  className="text-sm text-foreground-muted hover:text-primary transition-colors"
                >
                  Methods
                </Link>
              </li>
                <li>
                  <a
                    href="https://github.com/rizkidsaputra/silentsteg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground-muted hover:text-primary transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <Link href="/about#privacy" className="text-sm text-foreground-muted hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/about#security" className="text-sm text-foreground-muted hover:text-primary transition-colors">
                    Security
                  </Link>
                </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col items-center gap-4">
          <p className="text-sm text-foreground-muted text-center">
            © {new Date().getFullYear()} SilentSteg. Created by{" "}
            <a
              href="https://github.com/rizkidsaputra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Rizki D. Saputra
            </a>
            {" & "}
            <a
              href="https://github.com/JonatannaelPanjaitan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Jonatannael Panjaitan
            </a>
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/rizkidsaputra"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-surface-secondary border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
              aria-label="Rizki GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/JonatannaelPanjaitan"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-surface-secondary border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
              aria-label="Jonatannael GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
