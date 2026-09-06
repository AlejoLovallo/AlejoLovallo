import Link from "next/link";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="page-root">
      <div className="atmosphere" aria-hidden />
      <header className="site-header">
        <div className="shell header-inner">
          <Link href="/" className="brand">
            Alejo Lovallo
          </Link>
          <nav className="nav" aria-label="Primary">
            <Link href="/#lists">Lists</Link>
            <Link href="/#writing">Writing</Link>
            <a href="https://fonder.la" target="_blank" rel="noreferrer">
              Fonder
            </a>
          </nav>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="shell footer-inner">
          <p>© {new Date().getFullYear()} Alejo Lovallo</p>
          <div className="footer-links">
            <a
              href="https://github.com/AlejoLovallo"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/alejo-ezequiel-lovallo-3340b315b/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://alejolovallo.medium.com"
              target="_blank"
              rel="noreferrer"
            >
              Medium
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
