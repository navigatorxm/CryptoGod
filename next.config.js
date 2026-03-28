/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  transpilePackages: ['recharts', 'victory-vendor'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'gateway.pinata.cloud' },
      { protocol: 'https', hostname: 'cloudflare-ipfs.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Fix victory-vendor/recharts: ESM files try to import d3 as separate npm packages
    // but they're bundled inside victory-vendor/lib. Alias them to the bundled CJS versions.
    const vendorLib = path.resolve('node_modules/victory-vendor/lib');
    config.resolve.alias = {
      ...config.resolve.alias,
      'd3-shape': path.join(vendorLib, 'd3-shape.js'),
      'd3-path': path.join(vendorLib, 'd3-path.js'),
      'd3-scale': path.join(vendorLib, 'd3-scale.js'),
      'd3-array': path.join(vendorLib, 'd3-array.js'),
      'd3-interpolate': path.join(vendorLib, 'd3-interpolate.js'),
      'd3-color': path.join(vendorLib, 'd3-color.js'),
      'd3-format': path.join(vendorLib, 'd3-format.js'),
      'd3-time': path.join(vendorLib, 'd3-time.js'),
      'd3-time-format': path.join(vendorLib, 'd3-time-format.js'),
      'd3-ease': path.join(vendorLib, 'd3-ease.js'),
    };

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty'],
  },
};

module.exports = nextConfig;
