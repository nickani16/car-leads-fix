import type { NextConfig } from "next";

const sharpRuntimeFiles = [
  'node_modules/sharp/**/*',
  'node_modules/@img/sharp-linux-x64/**/*',
  'node_modules/@img/sharp-libvips-linux-x64/**/*',
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    viewTransition: true,
  },
  serverExternalPackages: ['sharp'],
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingIncludes: {
    '/api/account/listings': sharpRuntimeFiles,
    '/api/account/company/inventory-sources/*': sharpRuntimeFiles,
    '/api/admin/inventory-imports/*': sharpRuntimeFiles,
    '/api/cron/dealer-inventory-import': sharpRuntimeFiles,
    '/api/dealer-offer-requests': sharpRuntimeFiles,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 78, 95],
    imageSizes: [96, 128, 256, 384, 640],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "worker-src 'self' blob:",
              "img-src 'self' data: blob: https://*.supabase.co https://*.cartocdn.com https://*.arcgisonline.com https://tiles.openfreemap.org https://demotiles.maplibre.org",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.cartocdn.com https://*.arcgisonline.com https://tiles.openfreemap.org https://demotiles.maplibre.org",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
