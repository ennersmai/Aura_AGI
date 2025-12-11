/**
 * Polyfill for node's util module to handle the deprecation warning for util._extend
 * This file is used by webpack/turbopack aliasing to replace the util module
 */

// Import the original util module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const originalUtil = require('util');

// Create a deep copy of the original util
const util = { ...originalUtil };

// If the original extend method exists, store it for reference
if (originalUtil._extend) {
  util._originalExtend = originalUtil._extend;
}

// Replace the deprecated _extend method with Object.assign
util._extend = Object.assign;

// Force _extend to be non-enumerable to avoid it appearing in Object.keys(util)
Object.defineProperty(util, '_extend', {
  enumerable: false,
  writable: true,
  configurable: true,
  value: Object.assign
});

// Log success in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('✅ util-polyfill loaded successfully');
}

// Export the modified util
module.exports = util; 