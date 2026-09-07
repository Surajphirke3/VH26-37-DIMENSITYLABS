import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Architecture — Zero-Hallucination Industrial RAG",
  description:
    "Deep dive into MEND-X's 5-stage ingestion pipeline, pgvector and ChromaDB dual vector persistence, deterministic refusal gates, and Groq LPU inference.",
  openGraph: {
    title: "Platform Architecture — Zero-Hallucination Industrial RAG | MEND - X",
    description:
      "5-stage ingestion pipeline, pgvector and ChromaDB dual vector persistence, deterministic refusal gates, and Groq LPU inference.",
    url: "https://mend-x.dimensitylabs.dev/architecture",
  },
};

export default function ArchitectureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
