/**
 * Decision Feedback System
 * 
 * This utility enhances AI prompts with feedback from previous decision
 * generation attempts to improve quality over time. It uses a lightweight
 * learning approach to guide the AI toward better decisions.
 */

import { NarrativeContextDebugTools } from '../types/global';

// Cache of recent enhancement patterns
const enhancementPatterns: Array<{
  pattern: string;
  weight: number;
}> = [
  {
    pattern: "Focus on providing distinct options that lead to meaningfully different outcomes.",
    weight: 1.0
  },
  {
    pattern: "Ensure each option has a clear and specific impact description.",
    weight: 0.8
  },
  {
    pattern: "Include appropriate tags for each option to improve relevance tracking.",
    weight: 0.7
  },
  {
    pattern: "Make sure the decision prompt is contextually relevant to recent narrative events.",
    weight: 0.9
  },
  {
    pattern: "Limit the number of options to 3-4 choices to avoid overwhelming the player.",
    weight: 0.6
  }
];

/**
 * Initializes the feedback system
 * 
 * This sets up event listeners and initial state for the feedback system
 * @returns Boolean indicating if initialization was successful
 */
export function initializeFeedbackSystem(): boolean {
  // Reset weights to initial values
  resetFeedbackWeights();
  
  // Add event listener for decision quality feedback if in browser environment
  if (typeof window !== 'undefined') {
    try {
      // Set up feedback listener on window object for debug purposes
      if (window.bhgmDebug) {
        // Use the narrativeContext property that already exists and has an index signature
        if (!window.bhgmDebug.narrativeContext) {
          window.bhgmDebug.narrativeContext = {
            showOptimizedContext: () => undefined,
            testCompression: () => undefined,
            compareTokenEstimation: () => ({ message: 'Not implemented' }),
            benchmarkCompressionEfficiency: () => undefined,
            getOptimalCompression: () => 'medium'
          };
        }
        
        // Now we can safely add our property to narrativeContext
        (window.bhgmDebug.narrativeContext as NarrativeContextDebugTools).feedbackSystem = {
          patterns: getFeedbackPatternWeights(),
          updateWeights: updateFeedbackWeights,
          reset: resetFeedbackWeights
        };
      }
      return true;
    } catch (error) {
      console.error('Failed to initialize feedback system:', error);
      return false;
    }
  }
  
  return false;
}

/**
 * Enhances a decision generation prompt with feedback guidance
 * 
 * @param basePrompt Original decision generation prompt
 * @returns Enhanced prompt with feedback guidance
 */
export function generateFeedbackEnhancedPrompt(basePrompt: string): string {
  // Select top 2-3 enhancement patterns based on weight
  const selectedPatterns = [...enhancementPatterns]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, Math.floor(Math.random() * 2) + 2); // Random 2-3 patterns
  
  // Create enhancement section
  const enhancementSection = selectedPatterns
    .map(p => `- ${p.pattern}`)
    .join('\n');
  
  // Add enhancement section to prompt
  return `${basePrompt}

Important guidance for high-quality decisions:
${enhancementSection}
`;
}

/**
 * Updates feedback pattern weights based on decision quality
 * 
 * @param appliedPatterns Patterns that were applied
 * @param success Whether the decision was successful
 */
export function updateFeedbackWeights(
  appliedPatterns: string[],
  success: boolean
): void {
  const weightAdjustment = success ? 0.1 : -0.05;
  
  // Update weights for applied patterns
  enhancementPatterns.forEach(pattern => {
    if (appliedPatterns.some(p => p === pattern.pattern)) {
      pattern.weight = Math.max(0.1, Math.min(1.0, pattern.weight + weightAdjustment));
    }
  });
}

/**
 * Resets feedback weights to default values
 */
export function resetFeedbackWeights(): void {
  enhancementPatterns.forEach(pattern => {
    pattern.weight = 0.7; // Default weight
  });
}

/**
 * Get current feedback pattern weights for debugging
 * 
 * @returns Copy of current enhancement patterns with weights
 */
export function getFeedbackPatternWeights(): Array<{
  pattern: string;
  weight: number;
}> {
  return [...enhancementPatterns];
}