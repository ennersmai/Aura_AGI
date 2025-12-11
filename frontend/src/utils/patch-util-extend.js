/**
 * Global patch for util._extend deprecation warning
 * This file is meant to be required early in the application startup
 */

// Try to patch the util._extend method globally to prevent deprecation warnings
try {
  // Get direct reference to the original util module
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const util = require('util');
  
  // Only patch if the _extend method exists and has not been patched already
  if (util._extend && util._extend !== Object.assign) {
    // Store original for reference if needed
    util._originalExtend = util._extend;
    
    // Replace with Object.assign
    util._extend = Object.assign;
    
    // Optional: log that we've patched it (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Successfully patched util._extend with Object.assign');
    }
  }
} catch (error) {
  // Log any errors but don't crash the application
  console.error('Failed to patch util._extend:', error);
}

// Export a marker that this patch has been loaded
module.exports = {
  patched: true
}; 