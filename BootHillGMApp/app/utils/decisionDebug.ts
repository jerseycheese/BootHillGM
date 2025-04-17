import { 
  getDecisionGenerationMode, 
  setDecisionGenerationMode, 
  generateEnhancedDecision,
  // Note: isGeneratingDecision is not directly exported, but used internally by the debug object
} from './contextualDecisionGenerator'; 
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
    // Ensure the base bhgmDebug object exists and satisfies the minimum BHGMDebug type
    if (!window.bhgmDebug) {
      window.bhgmDebug = {
        version: '1.0.0',
        triggerDecision: (locationType?: LocationType) => {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('Decision triggered (initial stub)', locationType);
          }
        },
        clearDecision: () => {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('Decision cleared (initial stub)');
          }
        },
        listLocations: () => {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('Listing locations (initial stub)');
          }
          return [];
        },
        sendCommand: (commandType: string, data?: unknown) => {
          if (process.env.NODE_ENV !== 'production') {
            console.debug(`Debug command (initial stub): ${commandType}`, data);
          }
        },
        // Initialize decisions property to satisfy the type
        decisions: {
          getMode: getDecisionGenerationMode,
          setMode: setDecisionGenerationMode,
          generateDecision: generateEnhancedDecision,
          pendingDecision: null,
          service: getContextualDecisionService(),
          lastDetectionScore: 0,
          isGenerating: () => false, // Placeholder
          evaluationLog: [], // Add missing property
          resetState: () => {
             if (process.env.NODE_ENV !== 'production') {
               console.debug('Decision state reset requested (initial stub)');
             }
          }
        }
      };
    }
    
    // Extend with decision debug functions - already properly typed in global.d.ts
    if (window.bhgmDebug) {
      // Re-fetch isGeneratingDecision state when accessed
      // This requires contextualDecisionGenerator.ts to export it or provide a getter
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
        isGenerating: getIsGenerating, // Use placeholder getter
        evaluationLog: [], // Add missing property
        resetState: () => {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('Decision state reset requested (implementation needed in contextualDecisionGenerator)');
          }
          // Placeholder: Actual reset logic needs to be implemented in contextualDecisionGenerator.ts
          // and potentially exposed via an exported function.
        },
      };
    }
    
    if (process.env.NODE_ENV !== 'production') {
    }
  }
}