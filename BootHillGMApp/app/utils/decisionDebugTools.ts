/**
 * Decision Debug Tools
 * 
 * Utility functions for debugging and monitoring decision generation.
 */

import { getDecisionGenerationMode, setDecisionGenerationMode } from './contextualDecisionGenerator';
import { getContextualDecisionService } from '../services/ai/contextualDecisionService';
import '../types/global.d';

/**
 * Initialize decision debug tools
 * Used by DevTools panel to set up debug environment
 */
export function initializeDecisionDebugTools() {
  if (typeof window !== 'undefined' && !window.bhgmDebug) {
    // Initialize with a more complete structure to satisfy the type
    window.bhgmDebug = {
      version: '1.0.0', // Add missing version
      // Add other missing top-level properties with placeholders if needed
      triggerDecision: () => console.warn('Debug triggerDecision not fully implemented here'),
      clearDecision: () => console.warn('Debug clearDecision not fully implemented here'),
      listLocations: () => { console.warn('Debug listLocations not fully implemented here'); return []; },
      sendCommand: () => console.warn('Debug sendCommand not fully implemented here'),
      decisions: {
        getMode: getDecisionGenerationMode,
        setMode: setDecisionGenerationMode,
        generateDecision: async (...args) => {
          // Use dynamic import to avoid circular dependency
          const { generateEnhancedDecision } = await import('./contextualDecisionGenerator');
          return generateEnhancedDecision(...args);
        },
        pendingDecision: null, // Initialize pendingDecision
        service: getContextualDecisionService(), // Initialize service
        lastDetectionScore: 0,
        isGenerating: () => false, // Will be updated by contextualDecisionGenerator
        resetState: () => {
          console.debug('Decision state reset via debug tools');
          // State will be reset in contextualDecisionGenerator
        },
        evaluationLog: []
      }
      // Add placeholders for other optional top-level properties
    };
  }
}
