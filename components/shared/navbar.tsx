"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/shoutout", label: "Upload Shoutout" },
  { href: "/gallery", label: "Gallery" },
  { href: "/gift", label: "Gift" },
  { href: "/shoutouts", label: "Shoutouts" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Navbar scroll effect
  useEffect(() => {
    function handleScroll() {
      const nav = document.querySelector(".navbar-root");
      if (nav) {
        nav.classList.toggle("navbar-scrolled", window.scrollY > 20);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="navbar-root" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link className="navbar-logo" href="/">
          <span className="navbar-logo-icon">🌸</span>
          <span className="navbar-logo-text">Naza</span>
        </Link>

        <div className="navbar-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className={`navbar-link ${pathname === link.href ? "navbar-link-active" : ""}`}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          className="navbar-hamburger"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span className={`hamburger-line ${mobileOpen ? "line1-open" : ""}`} />
          <span className={`hamburger-line ${mobileOpen ? "line2-open" : ""}`} />
          <span className={`hamburger-line ${mobileOpen ? "line3-open" : ""}`} />
        </button>
      </div>

      <div className={`navbar-mobile ${mobileOpen ? "navbar-mobile-open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            className={`navbar-mobile-link ${pathname === link.href ? "navbar-mobile-link-active" : ""}`}
            href={link.href}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
