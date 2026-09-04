"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/lib/theme-context";

export default function IndustrialHeroBackground() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Particle nodes
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }

    const particleCount = Math.min(40, Math.floor(width / 35));
    const particles: Particle[] = [];

    // Theme-adjusted colors
    const colors = isLight
      ? ["#4f46e5", "#0d9488", "#2563eb", "#0284c7"]
      : ["#06b6d4", "#10b981", "#6366f1", "#3b82f6"];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: isLight ? Math.random() * 0.4 + 0.3 : Math.random() * 0.5 + 0.25,
      });
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting lines between particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.globalAlpha = p1.alpha;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - dist / 125) * (isLight ? 0.22 : 0.28);
            ctx.lineWidth = isLight ? 0.6 : 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw subtle interactive spotlight on mouse
      if (mousePos.x > 0 && mousePos.y > 0) {
        const gradient = ctx.createRadialGradient(
          mousePos.x,
          mousePos.y,
          0,
          mousePos.x,
          mousePos.y,
          260
        );
        gradient.addColorStop(
          0,
          isLight ? "rgba(79, 70, 229, 0.05)" : "rgba(20, 184, 166, 0.08)"
        );
        gradient.addColorStop(
          0.5,
          isLight ? "rgba(13, 148, 136, 0.03)" : "rgba(99, 102, 241, 0.04)"
        );
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLight, mousePos]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* ─── Cinematic Industrial Photo/Video Backdrop (White & Dark Theme Adapted) ─── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/industrial-hero.jpg"
          alt="Cinematic Industrial Facility"
          fill
          priority
          sizes="100vw"
          className={`object-cover object-center scale-105 animate-pulse-slow filter ${
            isLight
              ? "opacity-15 mix-blend-multiply brightness-105 contrast-110"
              : "opacity-35 brightness-90 contrast-125"
          }`}
        />

        {/* Dual-Theme Atmospheric Gradient Overlays for High-Contrast Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/85 to-[var(--bg-base)]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)]/95 via-transparent to-[var(--bg-base)]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[var(--bg-base)]/60 to-[var(--bg-base)]" />
      </div>

      {/* ─── Animated Vertical Laser Scanline Sweep ─── */}
      <div className="absolute inset-x-0 h-44 bg-gradient-to-b from-transparent via-teal-500/10 dark:via-cyan-500/15 to-transparent -top-44 animate-scanline pointer-events-none" />

      {/* ─── Real-Time HTML5 Particle & Circuit Canvas ─── */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none ${
          isLight ? "opacity-60" : "opacity-80"
        }`}
      />
    </div>
  );
}
