import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/auth-context";

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

export const metadata: Metadata = {
  title: "MEND - X — From Failure to Function | Industrial Diagnostics",
  description:
    "MEND - X — Intelligent Machine Troubleshooting & Industrial RAG for Factory Floor Diagnostics",
  icons: {
    icon: "/logo-solid.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-[#08090c] text-[#f1f5f9]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
