import type { NextConfig } from "next";
import { legacyRedirects } from "./src/lib/legacy-redirects";

const nextConfig: NextConfig = {
  transpilePackages: ["geist"],

  // TypeScript errors will now be caught during build
  // SEO & Performance Optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },

  // Headers for Security & SEO
  async redirects() {
    return [
      // Recover the WordPress URLs Google still has indexed. Permanent (308):
      // the old blog is gone for good, and we want the link equity moved, not
      // borrowed. See src/lib/legacy-redirects.ts.
      ...legacyRedirects.map(({ from, to }) => ({
        source: from,
        destination: to,
        permanent: true,
      })),
      // Safety net for the old posts not yet enumerated. Any /YYYY/MM/slug
      // that did not match a rule above lands on the blog index instead of a
      // 404 — a worse signal than a real match, but a far better one than
      // nothing while the list is completed from Search Console.
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:slug*',
        destination: '/pt-BR/blog',
        permanent: false,
      },
    ];
  },

  async headers() {
    const strictTransport = {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    };

    return [
      // ── Arquivos servidos do R2 ──────────────────────────
      //
      // Regra própria, e a global abaixo exclui `/img/` de propósito.
      //
      // A rota `/img/[...key]` define os próprios cabeçalhos, mas quem
      // vence é esta configuração: um `Content-Security-Policy` emitido
      // pelo route handler foi substituído pelo global em produção —
      // medido, não suposto. Como a regra do Next prevalece, o lugar certo
      // da política é aqui.
      //
      // O que muda em relação à global: `default-src 'none'; sandbox`
      // neutraliza o arquivo caso alguém consiga abri-lo como documento, e
      // `X-Frame-Options: DENY` é mais estrito que o `SAMEORIGIN` do site —
      // não há motivo para emoldurar uma foto.
      {
        source: '/img/:path*',
        headers: [
          strictTransport,
          { key: 'Content-Security-Policy', value: "default-src 'none'; sandbox" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
      {
        // Tudo menos `/img/`, que tem a regra acima. Sem esta exclusão as
        // duas casariam e a política permissiva do site voltaria a valer
        // sobre as fotos.
        source: '/((?!img/).*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.youtube.com https://platform.twitter.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.anthropic.com https://generativelanguage.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://platform.twitter.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
