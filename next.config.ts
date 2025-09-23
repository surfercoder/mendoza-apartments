import type { NextConfig } from "next";

// Derive Supabase project host from env to configure next/image remote patterns
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
let remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

try {
  if (SUPABASE_URL) {
    const url = new URL(SUPABASE_URL);
    // e.g. abcdefgh.supabase.co
    const hostname = url.hostname;
    remotePatterns = [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/apartments/**",
      },
    ];
  } else {
    // Fallback pattern if env is missing at build (dev safety)
    remotePatterns = [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/apartments/**",
      },
    ];
  }
} catch {
  // No-op; keep default remotePatterns empty in case of invalid URL
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
