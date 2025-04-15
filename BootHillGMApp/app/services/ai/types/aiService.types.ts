
/**
 * AIRetryOptions - Configuration for AI service retry functionality
 */
export interface AIRetryOptions {
  maxRetries: number;
  retryDelayMs: number;
}

/**
 * MockResponseOptions - Options for creating mock AI responses
 */
export interface MockResponseOptions {
  characterName: string;
  timestamp: string;
}

/**
 * NarrativeSummaryOptions - Options for generating narrative summaries
 */
export interface NarrativeSummaryOptions {
  content: string;
  context?: string;
}
