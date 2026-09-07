import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Model Suite — Nord 1B, Forge 2B & Apex 4B",
  description:
    "Explore MEND-X's tri-tier intelligence architecture: Nord 1B (<100ms error code triage), Forge 2B (1-2s multi-step diagnostics), and Apex 4B (deep root-cause reasoning on Groq LPU).",
  openGraph: {
    title: "AI Model Suite — Nord 1B, Forge 2B & Apex 4B | MEND - X",
    description:
      "Tri-tier intelligence cascade on Groq LPU delivering sub-8s verified industrial diagnostics with zero hallucinations.",
    url: "https://mend-x.dimensitylabs.dev/models",
  },
};

export default function ModelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
