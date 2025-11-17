/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Increase body size limit for file uploads (Next.js 15+)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Turbopack configuration for Next.js 15+
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      canvas: './empty.js',
      encoding: './empty.js',
    },
  },
  webpack: (config, { isServer }) => {
    // Fix for react-pdf and pdfjs-dist compatibility
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        encoding: false,
      };
      
      // Exclude problematic modules from being processed
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'canvas',
      });
    }
    
    // Handle pdfjs-dist properly
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
};

export default nextConfig;
