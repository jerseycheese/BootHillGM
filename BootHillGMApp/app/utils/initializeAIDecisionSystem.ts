/**
 * Initialize the AI Decision System
 * 
 * This file contains utility functions to initialize the AI-driven
 * contextual decision system at application startup.
 */

import { getContextualDecisionService } from '../services/ai/contextualDecisionService';
import { initializeDecisionDebugTools } from './contextualDecisionGenerator.enhanced';
import { initializeFeedbackSystem } from './decisionFeedbackSystem';
// Import evaluateDecisionQuality properly instead of using require
import { evaluateDecisionQuality } from './decisionQualityAssessment';

/**
 * Initialize all AI decision system components.
 * Call this during application initialization, e.g. in a provider.
 */
export function initializeAIDecisionSystem(): void {
  try {
    // Initialize the decision service singleton
    getContextualDecisionService();
    
    // Initialize feedback system for quality assessment
    initializeFeedbackSystem();
    
    // Initialize debug tools if in browser environment
    if (typeof window !== 'undefined') {
      initializeDecisionDebugTools();
      
      // Set global last detection score property
      // Create default debug object with all required properties if it doesn't exist
      if (!window.bhgmDebug) {
        window.bhgmDebug = {
          version: '1.0.0',
          triggerDecision: () => {},
          clearDecision: () => {},
          listLocations: () => [],
          sendCommand: () => {}
        };
      }

      // Initialize decisions property with isGenerating to match the interface
      window.bhgmDebug.decisions = window.bhgmDebug.decisions || {
        lastDetectionScore: 0,
        pendingDecision: null,
        getMode: () => 'hybrid',
        setMode: () => {},
        generateDecision: async () => null,
        service: getContextualDecisionService(),
        isGenerating: () => false
      };
      
      // Add quality debugging - using proper dynamic imports for browser environment
      // Ensure bhgmDebug exists with non-null assertion after the check above
      window.bhgmDebug!.quality = {
        evaluateLastDecision: () => {
          // Use optional chaining for both bhgmDebug and decisions
          if (window.bhgmDebug?.decisions?.pendingDecision) {
            const decision = window.bhgmDebug.decisions.pendingDecision;
            const narrativeContext = window.bhgmDebug?.getGameState?.()?.narrative?.narrativeContext;
            
            // Use the imported function directly to avoid require()
            const quality = evaluateDecisionQuality(decision, narrativeContext);
            console.info('Last decision quality evaluation:', quality);
            return true;
          }
          console.warn('No decision to evaluate');
          return false;
        },
        
        // Use the imported function directly
        evaluateDecision: (decision, context) => {
          try {
            return evaluateDecisionQuality(decision, context);
          } catch (e) {
            console.error('Error evaluating decision quality:', e);
            return { score: 0, suggestions: ['Error evaluating quality'], acceptable: false };
          }
        }
      };
      
      console.log('AI Decision System initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize AI Decision System:', error);
  }
}

export default initializeAIDecisionSystem;