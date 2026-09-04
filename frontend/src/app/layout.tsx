import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "MEND - X — From Failure to Function | Industrial Diagnostics",
  description: "MEND - X — Intelligent Machine Troubleshooting & Industrial RAG for Factory Floor Diagnostics",
  icons: {
    icon: "/logo-solid.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#04040f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
