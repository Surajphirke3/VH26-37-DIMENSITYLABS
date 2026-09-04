"use client";

import { useEffect, useRef, useState } from "react";

const TEXTS = [
  "Industrial AI.",
  "Predictive Intelligence.",
  "Smart Diagnostics.",
  "Zero Downtime.",
];

export default function TypewriterText() {
  const [displayed, setDisplayed] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = TEXTS[textIndex];
    const speed = isDeleting ? 40 : 80;
    const pause = 2200;

    if (!isDeleting && displayed === current) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), pause);
      return;
    }

    if (isDeleting && displayed === "") {
      setIsDeleting(false);
      setTextIndex((i) => (i + 1) % TEXTS.length);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setDisplayed(
        isDeleting ? current.slice(0, displayed.length - 1) : current.slice(0, displayed.length + 1)
      );
    }, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayed, isDeleting, textIndex]);

  return (
    <span className="landing-typewriter">
      {displayed}
      <span className="landing-cursor" aria-hidden="true">|</span>
    </span>
  );
}
