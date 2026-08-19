import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds the on-device demo (e.g. GitHub Pages): no server,
// API routes are removed by the deploy workflow, and the optional AI/account
// features switch off gracefully in the client.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(staticExport
    ? {
        output: "export" as const,
        basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
