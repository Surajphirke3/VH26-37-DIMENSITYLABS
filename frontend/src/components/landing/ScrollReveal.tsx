"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const translateMap = {
      up: "translateY(40px)",
      left: "translateX(-40px)",
      right: "translateX(40px)",
      scale: "scale(0.85)",
    };

    // Set initial hidden state
    el.style.opacity = "0";
    el.style.transform = translateMap[direction];
    el.style.transition = `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`;
    el.style.willChange = "opacity, transform";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "none";
            observer.unobserve(el);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
