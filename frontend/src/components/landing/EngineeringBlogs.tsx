"use client";

import React from "react";
import Image from "next/image";

const DISPATCHES = [
  {
    title: "How VecDB Ripped Through 1.2M Pages of Boeing Service Bulletins in seconds.",
    date: "Aug 14, 2026",
    tag: "AEROSPACE",
    readTime: "6 min read",
    img: "https://images.unsplash.com/photo-1549449830-ec387d7b30cd?w=800&q=80",
    desc: "A deep dive into our deterministic chunking algorithms tailored for unstructured PDF documents, cutting down false positives by 94% on legacy maintenance records."
  },
  {
    title: "Tri-Tier LLM Architecture: Why we deployed dynamic Groq LPU routing for Nord, Forge, and Apex.",
    date: "Aug 02, 2026",
    tag: "ENGINEERING",
    readTime: "12 min read",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    desc: "Latency kills flow. Why querying heavy reasoning models for simple error codes wastes capital, and how our Groq LPU router achieved 45ms median response times."
  },
  {
    title: "Case Study: Recovering a KUKA KR-210 Cell 4 Hours Faster.",
    date: "Jul 28, 2026",
    tag: "CASE STUDY",
    readTime: "5 min read",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    desc: "When an automotive Tier-1 supplier lost communication on their main welding cell, MEND-X navigated 4 different nested fault trees to isolate the Profinet switch."
  }
];

export default function EngineeringBlogs() {
  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 border-t border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6 animate-slide-up">
        <div>
          <span className="inline-block font-mono text-[10px] uppercase font-bold text-violet-500 tracking-widest bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20 mb-4">
            Engineering Dispatches
          </span>
          <h2 className="font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight leading-tight">
            Notes from the <span className="gradient-text">Frontline.</span>
          </h2>
        </div>
        <button className="shrink-0 px-6 py-2 rounded-full border border-[var(--border)] glass-hover text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
          View All Archives
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DISPATCHES.map((blog, i) => (
          <div key={i} className="group cyber-card bg-transparent animate-slide-up" style={{ animationDelay: `${0.2 * i}s` }}>
            {/* Image container */}
            <div className="w-full h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)] to-transparent z-10" />
              {/* Fallback pattern if image is missing, though we use unsplash */}
              <div className="absolute inset-0 bg-slate-800" />
              {blog.img && (
                <Image src={blog.img} alt={blog.title} fill unoptimized className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-60 group-hover:opacity-100" />
              )}
              {/* Tags absolute positioned */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <span className="font-mono text-[9px] font-bold text-white bg-violet-600/80 backdrop-blur px-2 py-0.5 rounded uppercase tracking-wider">
                  {blog.tag}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 relative z-20 -mt-6">
              <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-3">
                <span>{blog.date}</span>
                <span className="w-1 h-1 rounded-full bg-violet-500" />
                <span>{blog.readTime}</span>
              </div>

              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 leading-snug group-hover:text-violet-400 transition-colors">
                {blog.title}
              </h3>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 line-clamp-3">
                {blog.desc}
              </p>

              <div className="flex items-center gap-2 text-xs font-bold text-violet-500 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                Read Dispatch
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
