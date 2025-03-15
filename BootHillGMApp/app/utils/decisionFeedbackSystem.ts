/**
 * Decision Feedback System
 * 
 * This module collects and processes feedback about AI-generated decisions
 * to improve the quality of future generations through:
 * 1. Decision quality tracking
 * 2. Player response analysis
 * 3. Feedback-based prompt improvement
 */

import { PlayerDecision, PlayerDecisionRecord, NarrativeContext } from "../types/narrative.types";
import { evaluateDecisionQuality } from "./decisionQualityAssessment";

/**
 * Analysis of a player's response to a decision
 */
interface PlayerResponseAnalysis {
  decisionId: string;
  choicePattern: 'first' | 'last' | 'middle' | 'random';
  responseTime: number; // milliseconds
  consideredOptions: number; // based on hover events
  decisionQuality: number; // score from quality assessment
}

/**
 * Feedback collected about decision quality
 */
interface DecisionFeedback {
  // Collection of recent decision quality metrics
  recentDecisionScores: number[];
  
  // Player response patterns
  playerResponses: PlayerResponseAnalysis[];
  
  // Common quality issues identified
  commonIssues: Map<string, number>;
  
  // Success rate of AI-generated decisions 
  successRate: number;
  
  // Last updated timestamp
  lastUpdated: number;
}

/**
 * Interface for feedback data structure
 */
interface FeedbackData {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
}

// Global feedback state
let decisionFeedback: DecisionFeedback = {
  recentDecisionScores: [],
  playerResponses: [],
  commonIssues: new Map(),
  successRate: 0,
  lastUpdated: Date.now()
};

/**
 * Reset the feedback system (typically for testing)
 */
export function resetFeedbackSystem(): void {
  decisionFeedback = {
    recentDecisionScores: [],
    playerResponses: [],
    commonIssues: new Map(),
    successRate: 0,
    lastUpdated: Date.now()
  };
}

/**
 * Process a new decision for quality feedback
 * 
 * @param decision The decision to evaluate
 * @param narrativeContext Current narrative context
 * @returns Quality assessment results
 */
export function processDecisionQuality(
  decision: PlayerDecision,
  narrativeContext?: NarrativeContext
): { 
  score: number;
  suggestions: string[];
  acceptable: boolean;
} {
  // Evaluate the decision quality
  const evaluation = evaluateDecisionQuality(decision, narrativeContext);
  
  // Record the quality score
  decisionFeedback.recentDecisionScores.push(evaluation.score);
  
  // Limit the history to last 20 decisions
  if (decisionFeedback.recentDecisionScores.length > 20) {
    decisionFeedback.recentDecisionScores.shift();
  }
  
  // Record any issues identified
  evaluation.suggestions.forEach(suggestion => {
    const count = decisionFeedback.commonIssues.get(suggestion) || 0;
    decisionFeedback.commonIssues.set(suggestion, count + 1);
  });
  
  // Update the success rate
  const successCount = decisionFeedback.recentDecisionScores.filter(score => score >= 0.7).length;
  decisionFeedback.successRate = successCount / decisionFeedback.recentDecisionScores.length;
  
  // Update timestamp
  decisionFeedback.lastUpdated = Date.now();
  
  return evaluation;
}

/**
 * Record a player's response to a decision
 * 
 * @param decisionRecord The decision record with player's choice
 * @param responseData Additional response data like timing
 */
export function recordPlayerResponse(
  decisionRecord: PlayerDecisionRecord,
  responseData: {
    responseTime: number;
    consideredOptions: number;
  }
): void {
  // Find the original decision
  const originalDecision = findOriginalDecision(decisionRecord.decisionId);
  if (!originalDecision) return;
  
  // Determine choice pattern
  const choicePattern = determineChoicePattern(
    originalDecision, 
    decisionRecord.selectedOptionId
  );
  
  // Create response analysis
  const analysis: PlayerResponseAnalysis = {
    decisionId: decisionRecord.decisionId,
    choicePattern,
    responseTime: responseData.responseTime,
    consideredOptions: responseData.consideredOptions,
    decisionQuality: findDecisionQuality(decisionRecord.decisionId) || 0.5
  };
  
  // Add to responses
  decisionFeedback.playerResponses.push(analysis);
  
  // Limit history to last 50 responses
  if (decisionFeedback.playerResponses.length > 50) {
    decisionFeedback.playerResponses.shift();
  }
  
  // Update timestamp
  decisionFeedback.lastUpdated = Date.now();
}

/**
 * Find a decision's quality score from history
 * 
 * In a real implementation, this would query from a database
 * This is a placeholder implementation
 */
function findDecisionQuality(_decisionId: string): number | null {
  // Unused parameter, but needed for function signature
  // Parameter name prefixed with underscore to indicate intentional non-use
  return 0.8; // Placeholder value
}

/**
 * Find original decision from ID
 * 
 * In a real implementation, this would query from a database
 * This is a placeholder implementation
 */
function findOriginalDecision(_decisionId: string): PlayerDecision | null {
  // Unused parameter, but needed for function signature
  // Parameter name prefixed with underscore to indicate intentional non-use
  return null; // Placeholder
}

/**
 * Determine the pattern of the player's choice
 * 
 * @param decision The original decision
 * @param selectedOptionId The selected option ID
 * @returns The choice pattern
 */
function determineChoicePattern(
  decision: PlayerDecision,
  selectedOptionId: string
): 'first' | 'last' | 'middle' | 'random' {
  const options = decision.options;
  const selectedIndex = options.findIndex(opt => opt.id === selectedOptionId);
  
  if (selectedIndex === 0) return 'first';
  if (selectedIndex === options.length - 1) return 'last';
  if (options.length > 2) return 'middle';
  return 'random';
}

/**
 * Get current feedback statistics
 * 
 * @returns Object with feedback statistics
 */
export function getDecisionFeedbackStats(): {
  averageQuality: number;
  successRate: number;
  commonIssues: [string, number][];
  responsePatterns: {
    averageResponseTime: number;
    choiceDistribution: Record<string, number>;
  };
} {
  // Calculate average quality
  const averageQuality = decisionFeedback.recentDecisionScores.length > 0
    ? decisionFeedback.recentDecisionScores.reduce((a, b) => a + b, 0) / decisionFeedback.recentDecisionScores.length
    : 0;
  
  // Get top issues
  const sortedIssues = Array.from(decisionFeedback.commonIssues.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Calculate response patterns
  const responses = decisionFeedback.playerResponses;
  const averageResponseTime = responses.length > 0
    ? responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length
    : 0;
  
  // Calculate choice distribution
  const patterns = ['first', 'last', 'middle', 'random'];
  const choiceDistribution: Record<string, number> = {};
  
  patterns.forEach(pattern => {
    const count = responses.filter(r => r.choicePattern === pattern).length;
    choiceDistribution[pattern] = responses.length > 0 
      ? count / responses.length 
      : 0;
  });
  
  return {
    averageQuality,
    successRate: decisionFeedback.successRate,
    commonIssues: sortedIssues,
    responsePatterns: {
      averageResponseTime,
      choiceDistribution
    }
  };
}

/**
 * Publish decision feedback to analytics or storage
 * Marked with underscore to indicate it's intentionally unused currently
 */
function _publishDecisionFeedback(_feedbackType: string): Promise<void> {
  // Implementation would go here in a production system
  return Promise.resolve();
}

/**
 * Store decision feedback in persistent storage
 * Marked with underscore to indicate it's intentionally unused currently
 */
function _storeDecisionFeedback(_feedbackData: FeedbackData): Promise<void> {
  // Implementation would go here in a production system
  return Promise.resolve();
}

/**
 * Generate a feedback-enhanced prompt based on collected data
 * 
 * This uses the feedback to improve prompts for future decision generation
 * 
 * @param basePrompt The base prompt template
 * @returns Enhanced prompt with feedback-based improvements
 */
export function generateFeedbackEnhancedPrompt(basePrompt: string): string {
  const stats = getDecisionFeedbackStats();
  
  // Extract common issues to address
  let issueGuidance = '';
  if (stats.commonIssues.length > 0) {
    issueGuidance = `
IMPORTANT: Avoid these common issues in your decisions:
${stats.commonIssues.map(([issue]) => `- ${issue}`).join('\n')}
`;
  }
  
  // Add player response guidance
  const responseGuidance = `
Player response patterns:
- Average response time: ${Math.round(stats.responsePatterns.averageResponseTime / 1000)} seconds
- Most commonly selected options: ${Object.entries(stats.responsePatterns.choiceDistribution)
  .sort((a, b) => b[1] - a[1])
  .map(([pattern, pct]) => `${pattern} (${Math.round(pct * 100)}%)`)
  .join(', ')}

Create decisions that are engaging and avoid predictable patterns.
`;
  
  // Combine everything
  return `${basePrompt}

${issueGuidance}

${responseGuidance}

Your recent decision quality score is ${Math.round(stats.averageQuality * 100)}%. 
Aim to create decisions that are relevant to the current narrative context, with diverse, 
meaningful options that present distinct approaches to the situation.
`;
}

/**
 * Initialize the feedback system with any persisted data
 * 
 * In a production system, this would load from storage
 */
export function initializeFeedbackSystem(): void {
  // In a real implementation, load saved feedback data
  // This is a placeholder for the initialization process
  
  if (typeof window !== 'undefined') {
    console.log('Decision feedback system initialized');
  }
}