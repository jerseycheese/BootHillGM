/**
 * AI Service Index
 * Exports all AI service components
 */

// Main service
export { AIService, aiServiceInstance } from './aiService';

// Types
export * from './types/gameService.types';
export * from './types/aiService.types';

// Generators
export { GameContentGenerator } from './generators/gameContentGenerator';
export { SummaryGenerator } from './generators/summaryGenerator';

// Utilities
export { createMockResponse, createMockSummary } from './utils/mockResponseGenerator';
export { generateFallbackResponse, generateFallbackSummary } from './utils/fallbackResponseGenerator';
