import type { NextConfig } from "next";
import path from 'path';
import type { Compiler } from 'webpack';

// Suppress the util._extend deprecation warning at the Node.js level
process.env.NODE_NO_WARNINGS = '1';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // For Docker deployment
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  // Configure options to fix HMR
  experimental: {
    // Keep existing Turbopack configuration
    turbo: {
      resolveAlias: {
        'util': path.resolve(__dirname, 'src/utils/util-polyfill.js'),
      },
    },
  },
  // Updated devIndicators config to use the current API
  devIndicators: {
    position: 'bottom-right',
  },
  // Webpack configuration (for non-Turbopack builds)
  webpack: (config, { isServer }) => {
    // Fix the util._extend deprecation warning using a more direct approach
    config.resolve.alias = {
      ...config.resolve.alias,
      // Replace util._extend with Object.assign
      'util': path.resolve(__dirname, 'src/utils/util-polyfill.js'),
    };
    
    // Add a plugin to explicitly patch the util._extend for dependencies
    config.plugins.push({
      apply(compiler: Compiler) {
        compiler.hooks.beforeCompile.tap('FixUtilExtendWarning', () => {
          // Patch util._extend globally before compilation
          try {
            const util = require('util');
            if (util._extend) {
              util._extend = Object.assign;
            }
          } catch (e) {
            // Do nothing if we can't require util
          }
        });
      }
    });
    
    return config;
  },
};

export default nextConfig;
