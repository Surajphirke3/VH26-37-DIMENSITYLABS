import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/i18n/context";
import { SpaceWarpProvider } from "@/components/common/SpaceWarpPortal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://mend-x.dimensitylabs.dev";
const SITE_TITLE = "MEND - X — From Failure to Function | Industrial Intelligence Platform";
const SITE_DESCRIPTION =
  "Next-generation industrial intelligence & zero-hallucination RAG troubleshooting platform. Transforms 800-page OEM technical manuals into instantaneous, cited repair protocols for manufacturing equipment.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | MEND - X — Industrial Intelligence Platform",
  },
  description: SITE_DESCRIPTION,
  applicationName: "MEND - X",
  authors: [{ name: "Dimensity Labs", url: SITE_URL }],
  creator: "Dimensity Labs",
  publisher: "Dimensity Labs",
  generator: "Next.js",
  keywords: [
    "MEND - X",
    "MEND-X",
    "Dimensity Labs",
    "Industrial Intelligence Platform",
    "Industrial RAG",
    "Factory Floor Diagnostics",
    "Zero Downtime Manufacturing",
    "OEM Technical Manual Troubleshooting",
    "Siemens SINAMICS G120",
    "Siemens SINAMICS S120",
    "Allen-Bradley PowerFlex 755",
    "Groq LPU Inference",
    "SCADA Predictive Maintenance",
    "Zero-Hallucination Retrieval",
    "Industrial AI Assistant",
    "Sub-8s Machine Diagnosis",
    "Optical Fault Code OCR",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "MEND - X by Dimensity Labs",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        secureUrl: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MEND - X — From Failure to Function | Industrial Diagnostics Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DimensityLabs",
    creator: "@DimensityLabs",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  category: "Industrial Technology & Artificial Intelligence",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "MEND - X",
      "alternateName": "MEND-X Industrial Diagnostics",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "url": SITE_URL,
      "description": SITE_DESCRIPTION,
      "screenshot": `${SITE_URL}/og-image.png`,
      "softwareVersion": "3.0.0",
      "author": {
        "@type": "Organization",
        "name": "Dimensity Labs",
        "url": SITE_URL,
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": [
        "Deterministic Zero-Hallucination Retrieval Augmented Generation",
        "Tri-Tier Adaptive Model Routing on Groq LPU (Nord 1B, Forge 2B, Apex 4B)",
        "Automated Multi-Page OEM PDF Parsing and Chunking",
        "Multimodal Optical Fault Code Recognition",
        "Air-Gapped & Offline Plant Compatibility",
        "Real-Time SCADA Telemetry & Execution Pipeline Tracker",
      ],
    },
    {
      "@type": "Organization",
      "name": "Dimensity Labs",
      "url": SITE_URL,
      "logo": `${SITE_URL}/dimensity-labs.png`,
      "sameAs": ["https://github.com/Surajphirke3/VH26-37-DIMENSITYLABS"],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#06070a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
        <ThemeProvider>
          <SessionProvider>
            <LanguageProvider>
              <SpaceWarpProvider>{children}</SpaceWarpProvider>
            </LanguageProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}