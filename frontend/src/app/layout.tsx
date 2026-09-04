import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MechMind — Machine Troubleshooting",
  description: "RAG-powered machine troubleshooting system for factory floors",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className="font-sans antialiased min-h-screen"
        style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
