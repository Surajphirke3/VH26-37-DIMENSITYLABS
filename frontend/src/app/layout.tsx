import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MEND - X — From Failure to Function | Industrial Diagnostics",
  description: "MEND - X — Intelligent Machine Troubleshooting & Industrial RAG for Factory Floor Diagnostics",
  icons: {
    icon: "/logo-solid.png",
  },
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
