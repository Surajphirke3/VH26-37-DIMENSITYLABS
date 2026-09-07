import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Industrial Downtime Crisis — $260K/Hour Reality",
  description:
    "How unplanned machine stoppages, 800-page OEM manuals, and tribal knowledge gaps paralyze modern factory lines — and how MEND-X eliminates the blind spot.",
  openGraph: {
    title: "The Industrial Downtime Crisis — $260K/Hour Reality | MEND - X",
    description:
      "Every hour of line stoppage costs $260,000. MEND-X transforms chaotic OEM manuals into deterministic, cited repair protocols.",
    url: "https://mend-x.dimensitylabs.dev/problem",
  },
};

export default function ProblemLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
