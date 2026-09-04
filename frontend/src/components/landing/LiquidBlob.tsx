"use client";

import { useEffect, useRef } from "react";

interface LiquidBlobProps {
  color1?: string;
  color2?: string;
  size?: number;
  speed?: number;
  className?: string;
  blur?: number;
}

export default function LiquidBlob({
  color1 = "#00f5ff",
  color2 = "#7c3aed",
  size = 400,
  speed = 8,
  className = "",
  blur = 80,
}: LiquidBlobProps) {
  const blobRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const blob = blobRef.current;
    if (!blob) return;

    let frame = 0;
    let animId: number;

    const animate = () => {
      frame += 0.005 * speed;
      const points = generateBlobPoints(frame);
      const path = blob.querySelector("path");
      if (path) {
        path.setAttribute("d", buildPath(points, size / 2, size / 2, size / 2.5));
      }
      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animId);
  }, [size, speed]);

  return (
    <svg
      ref={blobRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ filter: `blur(${blur}px)`, willChange: "transform" }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`blobGrad-${color1.replace("#", "")}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color1} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color2} stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <path
        d=""
        fill={`url(#blobGrad-${color1.replace("#", "")})`}
      />
    </svg>
  );
}

function generateBlobPoints(t: number): number[] {
  const numPoints = 8;
  const points: number[] = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const noise =
      Math.sin(t + i * 1.2) * 0.15 +
      Math.sin(t * 1.7 + i * 0.8) * 0.1 +
      Math.sin(t * 0.6 + i * 2.1) * 0.08;
    points.push(1 + noise);
  }
  return points;
}

function buildPath(radii: number[], cx: number, cy: number, baseR: number): string {
  const numPoints = radii.length;
  const angleStep = (Math.PI * 2) / numPoints;

  const pts = radii.map((r, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * baseR * r,
      y: cy + Math.sin(angle) * baseR * r,
    };
  });

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < numPoints; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % numPoints];
    const mx = (curr.x + next.x) / 2;
    const my = (curr.y + next.y) / 2;
    d += ` Q ${curr.x} ${curr.y}, ${mx} ${my}`;
  }
  d += " Z";
  return d;
}
