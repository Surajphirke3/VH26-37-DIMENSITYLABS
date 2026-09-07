import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Troubleshooting Console & Field Workspace",
  description:
    "Interactive industrial diagnostics workspace with multi-turn chat, OCR visual fault code extraction, step-by-step repair directives, and page-exact citations.",
  openGraph: {
    title: "Troubleshooting Console & Field Workspace | MEND - X",
    description:
      "Real-time machine troubleshooting console with exact manual citations, fault codes, and safety protocols.",
    url: "https://mend-x.dimensitylabs.dev/dashboard",
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
