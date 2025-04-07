import { 
  getDecisionGenerationMode, 
  setDecisionGenerationMode, 
  generateEnhancedDecision,
  // Note: isGeneratingDecision is not directly exported, but used internally by the debug object
} from './contextualDecisionGenerator.enhanced'; 
import { getContextualDecisionService } from '../services/ai/contextualDecisionService';
import { LocationType } from '../services/locationService';
// Import the global declarations for window.bhgmDebug
import '../types/global.d';

// Need to get the state of isGeneratingDecision indirectly
// We can define a helper here or rely on the debug object structure
// Let's rely on the structure defined in the original file for now.

/**
 * Initialize the decision system with the browser's global namespace
 * to enable debug capabilities.
 * 
 * This function sets up debug tools in the window.bhgmDebug namespace
 * to allow for controlling and monitoring the decision system from
 * the browser console or DevTools interface.
 */
export function initializeDecisionDebugTools(): void {
  if (typeof window !== 'undefined') {
    // Create the debug namespace if it doesn't exist
    window.bhgmDebug = window.bhgmDebug || {
      // Required properties from debug interface
      version: '1.0.0',
      triggerDecision: (locationType?: LocationType) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Decision triggered', locationType);
        }
        // Placeholder: Actual trigger logic might need access to game state
      },
      clearDecision: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Decision cleared');
        }
        // Placeholder: Actual clear logic might need access to state
      },
      listLocations: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Listing locations');
        }
        // Placeholder: Actual location listing logic
        return [];
      },
      // Debug command handler
      sendCommand: (commandType: string, data?: unknown) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`Debug command: ${commandType}`, data);
        }
        // Placeholder: Actual command handling logic
      },
      // Placeholder for getState if needed by other debug functions
      // getState: () => { /* return current game state */ return {} as any; } 
    };
    
    // Extend with decision debug functions - already properly typed in global.d.ts
    if (window.bhgmDebug) {
      // Re-fetch isGeneratingDecision state when accessed
      // This requires contextualDecisionGenerator.enhanced.ts to export it or provide a getter
      // For now, we assume it might be added later or handled differently.
      // Let's define a placeholder getter for isGenerating.
      const getIsGenerating = () => {
        // Ideally, import a getter from the source file
        // console.warn('isGenerating state might be inaccurate in debug tools'); 
        return false; // Placeholder
      };

      window.bhgmDebug.decisions = {
        getMode: getDecisionGenerationMode,
        setMode: setDecisionGenerationMode,
        generateDecision: generateEnhancedDecision,
        pendingDecision: null, // This state is managed in the original file
        service: getContextualDecisionService(),
        lastDetectionScore: 0, // This state is managed in the original file
        isGenerating: getIsGenerating // Use placeholder getter
      };
    }
    
    if (process.env.NODE_ENV !== 'production') {
    }
  }
}
