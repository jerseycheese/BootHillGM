/**
 * AI Services barrel file
 * 
 * Exports all AI-related services to simplify imports.
 */

// AI Service
export { default as AIService } from './aiService';

// Decision Service
export { default as DecisionService } from './decision-service';
export { default as AIDecisionGenerator } from './decision-service/decision-generator';
export { default as NarrativeDecisionDetector } from './decision-service/narrative-decision-detector';
export { default as DecisionHistoryService } from './decision-service/decision-history-service';
export { default as AIServiceClient } from './decision-service/ai-service-client';

// Summary Generation
export { generateCharacterSummary } from './summaryGenerator';
export const generateNarrativeSummary = async (content: string, _context: string): Promise<string> => {
  // Simple implementation that returns the first 100 characters as a summary
  // or returns just 'Summary' when in test environments
  return content.slice(0, 100) + (content.length > 100 ? '...' : '');
};