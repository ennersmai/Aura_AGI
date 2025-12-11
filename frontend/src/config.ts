/**
 * Global configuration settings for the Aura application
 */

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:8080/ws';

// Feature flags
export const FEATURES = {
  DEBUG_PANEL: true,
  METRICS: true,
  MEMORY_VISUALIZATION: false,
  REFLECTION_INSIGHTS: false,
};

// UI configuration
export const UI_CONFIG = {
  THEME_COLOR: '#f5cc7f',
  SECONDARY_COLOR: '#c09c58',
  MAX_MESSAGES_PER_PAGE: 50,
  DEFAULT_TRANSITION_DURATION: 300, // ms
};

// Default settings
export const DEFAULT_SETTINGS = {
  debugPanelOpen: false,
  debugStreams: {
    orchestrator: true,
    reasoning: true,
    gemini: true,
  },
  debugOptions: {
    showTokens: true,
    showTimestamps: false,
  },
}; 