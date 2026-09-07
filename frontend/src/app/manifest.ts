import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MEND - X — Industrial Intelligence Platform",
    short_name: "MEND - X",
    description:
      "From Failure to Function: Zero-Hallucination Industrial RAG Troubleshooting Platform for Factory Equipment.",
    start_url: "/",
    display: "standalone",
    background_color: "#06070a",
    theme_color: "#00f5a0",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
