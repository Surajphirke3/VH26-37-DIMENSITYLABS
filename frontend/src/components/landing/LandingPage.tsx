"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import TypewriterText from "./TypewriterText";
import ScrollReveal from "./ScrollReveal";

const LiquidBlob = dynamic(() => import("./LiquidBlob"), { ssr: false });
const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });

const STATS = [
  { value: "99.7%", label: "Uptime Guarantee" },
  { value: "3.2s", label: "Avg Response Time" },
  { value: "500+", label: "Factories Deployed" },
  { value: "10M+", label: "Issues Resolved" },
];

const FEATURES = [
  {
    icon: "🧠",
    title: "RAG-Powered Diagnostics",
    desc: "Retrieve-Augmented Generation instantly surfaces the most relevant machine manuals, error logs, and repair history for any fault.",
    gradient: "from-cyan-500/20 to-violet-500/10",
  },
  {
    icon: "⚡",
    title: "Real-Time Fault Detection",
    desc: "Millisecond-level sensor fusion detects anomalies before they escalate, with predictive alerts sent directly to your team.",
    gradient: "from-violet-500/20 to-fuchsia-500/10",
  },
  {
    icon: "📊",
    title: "Intelligent Analytics",
    desc: "Deep-learning models continuously learn from every repair event, making your factory smarter with every cycle.",
    gradient: "from-fuchsia-500/20 to-pink-500/10",
  },
  {
    icon: "🔒",
    title: "Enterprise Security",
    desc: "Air-gapped deployments, end-to-end encryption, and role-based access control built for mission-critical environments.",
    gradient: "from-indigo-500/20 to-cyan-500/10",
  },
  {
    icon: "🌐",
    title: "Multi-Site Orchestration",
    desc: "Manage hundreds of factory floors from a single pane of glass with zero-latency edge-cloud hybrid architecture.",
    gradient: "from-teal-500/20 to-emerald-500/10",
  },
  {
    icon: "🤖",
    title: "Autonomous Resolution",
    desc: "Self-healing workflows automatically route tickets, dispatch technicians, and order parts — all without human intervention.",
    gradient: "from-rose-500/20 to-orange-500/10",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Connect Your Machines", desc: "Plug in our edge sensors or connect via OPC-UA, MQTT, Modbus — we speak every industrial protocol." },
  { step: "02", title: "AI Ingests Your Data", desc: "Our RAG engine indexes your manuals, schematics, and historical logs to build a machine-aware knowledge base." },
  { step: "03", title: "Detect & Diagnose", desc: "When anomalies occur, MechMind cross-references real-time telemetry with your knowledge base in seconds." },
  { step: "04", title: "Resolve & Learn", desc: "Technicians get step-by-step guided fixes. Every resolution improves the model for next time." },
];

const SKILLS_DATA = [
  { name: "Fault Detection", pct: 97 },
  { name: "Predictive Maintenance", pct: 94 },
  { name: "Root Cause Analysis", pct: 91 },
  { name: "Knowledge Retrieval", pct: 98 },
  { name: "Autonomous Resolution", pct: 88 },
];

export default function LandingPage() {
  return (
    <main className="landing-root" id="hero">
      {/* ─── HERO SECTION ─── */}
      <section className="landing-hero" aria-label="Hero">
        {/* Particle background */}
        <ParticleField />

        {/* Morphing blobs */}
        <div className="landing-blob landing-blob--1" aria-hidden="true">
          <LiquidBlob color1="#00f5ff" color2="#7c3aed" size={600} speed={6} blur={100} />
        </div>
        <div className="landing-blob landing-blob--2" aria-hidden="true">
          <LiquidBlob color1="#a855f7" color2="#ec4899" size={500} speed={9} blur={110} />
        </div>
        <div className="landing-blob landing-blob--3" aria-hidden="true">
          <LiquidBlob color1="#06b6d4" color2="#6366f1" size={350} speed={12} blur={90} />
        </div>

        {/* Grid overlay */}
        <div className="landing-grid-overlay" aria-hidden="true" />

        {/* Hero content */}
        <div className="landing-hero__content">
          <div className="landing-hero__badge">
            <span className="landing-hero__badge-dot" aria-hidden="true" />
            <span>AI-Powered Industrial Intelligence</span>
          </div>

          <h1 className="landing-hero__headline">
            The Future of<br />
            <TypewriterText />
          </h1>

          <p className="landing-hero__sub">
            MechMind brings RAG-powered diagnostics directly to your factory floor.
            Ask any question. Get expert-level answers. <strong>In seconds.</strong>
          </p>

          <div className="landing-hero__actions">
            <Link href="/dashboard" className="landing-btn landing-btn--hero-primary" id="hero-cta-primary">
              <span>Launch Dashboard</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#how-it-works" className="landing-btn landing-btn--hero-ghost" id="hero-cta-secondary"
              onClick={e => { e.preventDefault(); document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" }); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              <span>See How It Works</span>
            </a>
          </div>

          {/* Stats */}
          <div className="landing-stats" role="list" aria-label="Key statistics">
            {STATS.map((s, i) => (
              <div key={i} className="landing-stat" role="listitem">
                <span className="landing-stat__value">{s.value}</span>
                <span className="landing-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="landing-scroll-hint" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ─── ABOUT / INTRO SECTION ─── */}
      <section className="landing-section landing-about" id="about" aria-label="About MechMind">
        <div className="landing-about__blob" aria-hidden="true">
          <LiquidBlob color1="#7c3aed" color2="#00f5ff" size={400} speed={5} blur={120} />
        </div>

        <div className="landing-container">
          <ScrollReveal direction="up">
            <div className="landing-section-label">About</div>
            <h2 className="landing-section-headline">
              Built for the <span className="landing-gradient-text">Factory Floor</span>
            </h2>
            <p className="landing-section-sub">
              Traditional troubleshooting is slow, inconsistent, and relies on institutional knowledge that walks out the door when experts retire.
              MechMind is the AI co-pilot that never sleeps — always ready to diagnose, guide, and resolve.
            </p>
          </ScrollReveal>

          {/* Skills bars */}
          <div className="landing-skills" aria-label="AI Capabilities">
            {SKILLS_DATA.map((skill, i) => (
              <ScrollReveal key={skill.name} delay={i * 80} direction="left">
                <div className="landing-skill-item">
                  <div className="landing-skill-header">
                    <span className="landing-skill-name">{skill.name}</span>
                    <span className="landing-skill-pct">{skill.pct}%</span>
                  </div>
                  <div className="landing-skill-bar" role="progressbar" aria-valuenow={skill.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${skill.name} accuracy: ${skill.pct}%`}>
                    <div
                      className="landing-skill-fill"
                      style={{ "--skill-pct": `${skill.pct}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="landing-section landing-features" id="features" aria-label="Features">
        <div className="landing-container">
          <ScrollReveal direction="up">
            <div className="landing-section-label">Features</div>
            <h2 className="landing-section-headline">
              Everything You Need to <span className="landing-gradient-text">Eliminate Downtime</span>
            </h2>
          </ScrollReveal>

          <div className="landing-features-grid" role="list">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 60} direction="scale">
                <article className={`landing-feature-card`} role="listitem">
                  <div className={`landing-feature-card__bg bg-gradient-to-br ${f.gradient}`} aria-hidden="true" />
                  <div className="landing-feature-card__icon" aria-hidden="true">{f.icon}</div>
                  <h3 className="landing-feature-card__title">{f.title}</h3>
                  <p className="landing-feature-card__desc">{f.desc}</p>
                  <div className="landing-feature-card__glow" aria-hidden="true" />
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS SECTION ─── */}
      <section className="landing-section landing-how" id="how-it-works" aria-label="How it works">
        <div className="landing-how__blob" aria-hidden="true">
          <LiquidBlob color1="#06b6d4" color2="#7c3aed" size={500} speed={4} blur={130} />
        </div>
        <div className="landing-container">
          <ScrollReveal direction="up">
            <div className="landing-section-label">Process</div>
            <h2 className="landing-section-headline">
              Up and Running in <span className="landing-gradient-text">4 Simple Steps</span>
            </h2>
          </ScrollReveal>

          <div className="landing-steps">
            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 120} direction={i % 2 === 0 ? "left" : "right"}>
                <div className="landing-step">
                  <div className="landing-step__number" aria-hidden="true">{step.step}</div>
                  <div className="landing-step__content">
                    <h3 className="landing-step__title">{step.title}</h3>
                    <p className="landing-step__desc">{step.desc}</p>
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="landing-step__connector" aria-hidden="true" />
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT / CTA SECTION ─── */}
      <section className="landing-section landing-contact" id="contact" aria-label="Contact and get started">
        <div className="landing-contact__blob landing-contact__blob--1" aria-hidden="true">
          <LiquidBlob color1="#a855f7" color2="#ec4899" size={450} speed={7} blur={120} />
        </div>
        <div className="landing-contact__blob landing-contact__blob--2" aria-hidden="true">
          <LiquidBlob color1="#00f5ff" color2="#6366f1" size={350} speed={10} blur={100} />
        </div>
        <div className="landing-container">
          <ScrollReveal direction="scale">
            <div className="landing-cta-card">
              <div className="landing-section-label">Get Started</div>
              <h2 className="landing-section-headline" style={{ marginBottom: "1rem" }}>
                Ready to Transform Your<br />
                <span className="landing-gradient-text">Factory Operations?</span>
              </h2>
              <p className="landing-section-sub" style={{ marginBottom: "2.5rem" }}>
                Join 500+ factories already running smarter with MechMind.<br />
                Deploy in minutes. No hardware changes required.
              </p>
              <div className="landing-contact__form" role="form" aria-label="Contact form">
                <input
                  type="email"
                  id="contact-email"
                  className="landing-input"
                  placeholder="your@company.com"
                  aria-label="Work email address"
                />
                <button type="button" id="contact-cta-btn" className="landing-btn landing-btn--hero-primary">
                  <span>Request Demo</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
              <p className="landing-contact__note">No credit card required • 14-day free trial • Enterprise plans available</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer" role="contentinfo">
        <div className="landing-container landing-footer__inner">
          <div className="landing-footer__brand">
            <span className="landing-nav__logo-icon" aria-hidden="true">⚙</span>
            <span>Mech<span className="landing-nav__logo-accent">Mind</span></span>
          </div>
          <p className="landing-footer__copy">
            © {new Date().getFullYear()} MechMind. Built with ❤️ for Industrial AI.
          </p>
          <nav className="landing-footer__links" aria-label="Footer navigation">
            <a href="#hero" className="landing-footer__link">Home</a>
            <a href="#about" className="landing-footer__link">About</a>
            <a href="#features" className="landing-footer__link">Features</a>
            <a href="#contact" className="landing-footer__link">Contact</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
