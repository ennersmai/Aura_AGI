/**
 * This file helps prevent the ISR (Incremental Static Regeneration) warnings
 * that can occur during development with Next.js Hot Module Replacement.
 * 
 * The error:
 * TypeError: Cannot read properties of undefined (reading 'components')
 * at handleStaticIndicator
 * 
 * This happens because Next.js tries to handle static indicators during HMR
 * but the reference structure might be different in development.
 */

// This is a patch applied at runtime to resolve issues with HMR and ISR indicators
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Override any indicator functions that might be called during HMR
  window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
  
  // Ensure the staticIndicatorComp property exists to prevent undefined errors
  if (!window.__NEXT_DATA__.staticIndicatorComp) {
    window.__NEXT_DATA__.staticIndicatorComp = {};
  }

  // Add empty components array if missing
  if (!window.__NEXT_DATA__.components) {
    window.__NEXT_DATA__.components = [];
  }
  
  // Monkey patch console.error to filter out specific HMR/ISR errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Filter out ISR-related errors to keep the console clean
    if (
      args[0] && 
      typeof args[0] === 'string' && 
      (
        args[0].includes('Cannot read properties of undefined (reading \'components\')') ||
        args[0].includes('isrManifest') ||
        args[0].includes('staticIndicator')
      )
    ) {
      // Silently suppress these specific errors
      return;
    }
    
    // Call the original console.error for all other errors
    originalConsoleError.apply(console, args);
  };
}

// Define a module object to export
const disableISRWarnings = {};

export default disableISRWarnings; 