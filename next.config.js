/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  
  // Use SWC for faster minification (3x faster than Terser)
  swcMinify: true,
  
  // Enable standalone output for Docker deployments
  output: 'standalone',
  
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
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.dexscreener.com https://eth.llamarpc.com https://bsc-dataseed1.binance.org https://polygon-rpc.com https://arb1.arbitrum.io/rpc https://mainnet.optimism.io https://api.avax.network https://api.mainnet-beta.solana.com https://rpc.sepolia.org https://data-seed-prebsc-1-s1.binance.org:8545 https://rpc-amoy.polygon.technology https://api.devnet.solana.com wss: https:",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
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
    // Optimize images for production
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  webpack: (config, { isServer, dev, config: { experimental } }) => {
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

    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Separate vendor chunks
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
          },
          // Separate React chunks
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 30,
          },
          // Web3 libraries
          web3: {
            test: /[\\/]node_modules[\\/](ethers|viem|wagmi|@rainbow-me)[\\/]/,
            name: 'web3',
            chunks: 'all',
            priority: 30,
          },
          // Charts library
          charts: {
            test: /[\\/]node_modules[\\/](recharts|victory|d3)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 30,
          },
          // Common components
          common: {
            minChunks: 2,
            name: 'common',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
      // Minimize chunk count
      config.optimization.runtimeChunk = false;
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty'],
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'recharts', 'ethers', 'viem', 'wagmi'],
  },
  // Production build optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
