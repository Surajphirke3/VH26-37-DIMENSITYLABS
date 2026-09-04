import Navbar from "@/components/landing/Navbar";
import LandingPage from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MechMind — AI-Powered Industrial Troubleshooting",
  description:
    "RAG-powered machine diagnostics that gives factory technicians expert-level answers in seconds. Predict faults. Resolve instantly. Zero downtime.",
  keywords: [
    "industrial AI",
    "machine troubleshooting",
    "predictive maintenance",
    "RAG AI",
    "factory floor AI",
    "fault detection",
  ],
  openGraph: {
    title: "MechMind — AI-Powered Industrial Troubleshooting",
    description: "Expert-level machine diagnostics powered by AI. Zero downtime.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <LandingPage />
    </>
  );
}
