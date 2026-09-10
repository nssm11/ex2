import type { NextConfig } from "next";

/**
 * `X-Frame-Options: DENY` is the safe default, but it also blocks legitimate
 * embedding (in-store kiosks, a demo/QA harness or a hosted preview). Opting in
 * with ALLOW_FRAME_EMBED swaps it for a CSP `frame-ancestors` rule, which is
 * the modern, per-origin way to express the same intent. Keep it off in prod.
 */
const allowEmbed = process.env.ALLOW_FRAME_EMBED === "true";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  ...(allowEmbed
    ? [{ key: "Content-Security-Policy", value: "frame-ancestors *" }]
    : [{ key: "X-Frame-Options", value: "DENY" }]),
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
