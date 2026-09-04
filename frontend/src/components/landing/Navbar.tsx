"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#hero");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setActiveLink(href);
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="landing-nav__inner">
        {/* Logo */}
        <a href="#hero" onClick={() => handleNav("#hero")} className="landing-nav__logo" aria-label="MechMind home">
          <span className="landing-nav__logo-icon" aria-hidden="true">⚙</span>
          <span>Mech<span className="landing-nav__logo-accent">Mind</span></span>
        </a>

        {/* Desktop links */}
        <ul className="landing-nav__links" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                className={`landing-nav__link ${activeLink === link.href ? "landing-nav__link--active" : ""}`}
                onClick={() => handleNav(link.href)}
                aria-current={activeLink === link.href ? "page" : undefined}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="landing-nav__actions">
          <Link href="/login" className="landing-btn landing-btn--ghost">Login</Link>
          <Link href="/dashboard" className="landing-btn landing-btn--primary">Get Started</Link>
        </div>

        {/* Hamburger */}
        <button
          className={`landing-hamburger ${menuOpen ? "landing-hamburger--open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`landing-mobile-menu ${menuOpen ? "landing-mobile-menu--open" : ""}`} aria-hidden={!menuOpen}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.href}
            className="landing-mobile-menu__link"
            onClick={() => handleNav(link.href)}
          >
            {link.label}
          </button>
        ))}
        <div className="landing-mobile-menu__actions">
          <Link href="/login" className="landing-btn landing-btn--ghost" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link href="/dashboard" className="landing-btn landing-btn--primary" onClick={() => setMenuOpen(false)}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
}
