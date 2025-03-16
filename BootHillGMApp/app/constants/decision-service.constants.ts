/**
 * Constants for the Decision Service
 */

// Default threshold for presenting a decision
export const DEFAULT_DECISION_THRESHOLD = 0.65;

// Minimum time between decisions in milliseconds (30 seconds)
export const MIN_DECISION_INTERVAL = 30 * 1000;

// Maximum number of decision history entries to keep
export const MAX_DECISION_HISTORY_SIZE = 10;

// Default maximum number of options per decision
export const MAX_OPTIONS_PER_DECISION = 4;

// Default API configuration
export const DEFAULT_API_CONFIG = {
  apiKey: process.env.AI_SERVICE_API_KEY || '',
  endpoint: process.env.AI_SERVICE_ENDPOINT || '',
  modelName: process.env.AI_SERVICE_MODEL || 'gpt-4',
  maxRetries: 3,
  timeout: 15000,
  rateLimit: 10
};

// Retry timing
export const RETRY_BASE_DELAY = 1000; // 1 second
