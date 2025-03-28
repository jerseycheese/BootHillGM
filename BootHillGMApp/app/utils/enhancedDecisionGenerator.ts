/**
 * Enhanced Decision Generator
 * 
 * This file serves as an integration layer between the existing decision system
 * and the new AI-driven contextual decision system. It enhances the DevTools
 * functionality while maintaining backward compatibility.
 */

import { getAIDecisionService, generateAIContextualDecision } from './contextualDecisionGenerator.ai';
import { generateContextualDecision } from './contextualDecisionGenerator';
import { createTestDecision } from './testNarrativeWithDecision';
import { GameState } from '../types/gameState';
import { LocationType } from '../services/locationService';
import { PlayerDecision } from '../types/narrative.types';
import { Character } from '../types/character';
// Import global type definitions
import '../types/global.d';

// Decision generation mode
export type DecisionGenerationMode = 'template' | 'ai' | 'hybrid';

// Current generation mode, defaulting to hybrid
let currentGenerationMode: DecisionGenerationMode = 'hybrid';

/**
 * Helper function to safely get player character from state
 * 
 * @param gameState Current game state
 * @returns Player character or undefined
 */
function getPlayerCharacter(gameState: GameState): Character | undefined {
  if (!gameState.character || !gameState.character.player) {
    return undefined;
  }
  return gameState.character.player;
}

/**
 * Set the decision generation mode
 * 
 * @param mode The decision generation mode to use
 */
export function setDecisionGenerationMode(mode: DecisionGenerationMode): void {
  currentGenerationMode = mode;
}

/**
 * Get the current decision generation mode
 * 
 * @returns The current decision generation mode
 */
export function getDecisionGenerationMode(): DecisionGenerationMode {
  return currentGenerationMode;
}

/**
 * Generate a contextual decision using the selected mode
 * 
 * This function serves as a bridge between the existing and new decision systems,
 * allowing for gradual transition to the AI-driven approach.
 * 
 * @param gameState Current game state
 * @param locationType Optional location type override
 * @param forceGeneration Whether to force generation even if detection threshold isn't met
 * @returns Promise resolving to a PlayerDecision or null
 */
export async function generateEnhancedDecision(
  gameState: GameState,
  locationType?: LocationType,
  forceGeneration: boolean = false
): Promise<PlayerDecision | null> {
  try {
    // Get the player character (if available)
    const playerCharacter = getPlayerCharacter(gameState);
    
    switch (currentGenerationMode) {
      case 'ai':
        // Use pure AI-driven generation
        return await generateAIContextualDecision(
          gameState,
          gameState.narrative.narrativeContext,
          locationType,
          playerCharacter // Pass the player character or undefined
        );
        
      case 'template':
        // Use the existing template-based generation
        return generateContextualDecision(
          gameState,
          gameState.narrative.narrativeContext,
          locationType
        );
        
      case 'hybrid':
      default:
        // Try AI generation first with a fallback to templates
        try {
          // If force generation is enabled, skip detection check
          if (forceGeneration) {
            // First check if we have a valid character object
            if (!playerCharacter) {
              console.error('Cannot generate forced AI decision: No character data available');
              return generateContextualDecision(
                gameState,
                gameState.narrative.narrativeContext,
                locationType
              );
            }
            
            const aiService = getAIDecisionService();
            return await aiService.generateDecision(
              gameState.narrative,
              playerCharacter, // Now using the player character
              gameState
            );
          }
          
          // Otherwise use normal AI generation with built-in detection
          const aiDecision = await generateAIContextualDecision(
            gameState,
            gameState.narrative.narrativeContext,
            locationType,
            playerCharacter // Pass the player character or undefined
          );
          
          if (aiDecision) {
            return aiDecision;
          }
          
          // Fall back to template-based generation if AI returns null
          return generateContextualDecision(
            gameState,
            gameState.narrative.narrativeContext,
            locationType
          );
        } catch (error) {
          console.error('AI generation failed, falling back to templates:', error);
          return generateContextualDecision(
            gameState,
            gameState.narrative.narrativeContext,
            locationType
          );
        }
    }
  } catch (error) {
    console.error('Error in generateEnhancedDecision:', error);
    
    // Last resort fallback: return a simple test decision
    return createTestDecision('moderate');
  }
}

/**
 * Override the existing generateContextualDecision function
 * for DevTools panel integration
 * 
 * This function allows the DevTools to use the enhanced system
 * while maintaining the same API signature.
 * 
 * @param gameState Current game state
 * @param narrativeContext Optional narrative context
 * @param locationType Optional location type
 * @returns PlayerDecision or null, matching the original API
 */
export function enhanceDecisionGenerator() {
  // Store reference to the original function for backup
  // Fix: Type-safe approach to access global property
  const originalGenerateContextualDecision = (typeof globalThis !== 'undefined' ? 
    (globalThis as unknown as Window).generateContextualDecision : undefined) 
    || (typeof window !== 'undefined' ? window.generateContextualDecision : undefined);
  
  // Create a custom type extension for debug properties
  type ExtendedDebug = typeof window.bhgmDebug & {
    pendingDecisionPromise?: Promise<PlayerDecision | null>;
    cachedDecision?: PlayerDecision | null;
  };

  // Create an enhanced version that can handle promises while maintaining synchronous API
  const enhancedGenerator = (
    gameState: GameState,
    narrativeContext?: Record<string, unknown>,
    locationType?: LocationType
  ): PlayerDecision | null => {
    // Start async generation
    const promise = generateEnhancedDecision(gameState, locationType);
    
    // Store the promise for later retrieval
    if (!window.bhgmDebug) {
      window.bhgmDebug = {
        version: '1.0.0',
        triggerDecision: () => {},
        clearDecision: () => {},
        listLocations: () => [],
        sendCommand: () => {}
      };
    }
    
    // Add a temporary property for the pending promise
    (window.bhgmDebug as ExtendedDebug).pendingDecisionPromise = promise;
    
    // If we already have a cached decision, use it
    if ((window.bhgmDebug as ExtendedDebug)?.cachedDecision) {
      const decision = (window.bhgmDebug as ExtendedDebug).cachedDecision;
      (window.bhgmDebug as ExtendedDebug).cachedDecision = null;
      return decision ?? null; // Fixed: Use nullish coalescing to ensure null is returned if decision is undefined
    }
    
    // Handle the async result when it's ready
    promise.then(decision => {
      if (decision) {
        (window.bhgmDebug as ExtendedDebug).cachedDecision = decision;
      }
    }).catch(error => {
      console.error('Error in async decision generation:', error);
    });
    
    // Fall back to the original (synchronous) method for this call
    if (originalGenerateContextualDecision) {
      return originalGenerateContextualDecision(gameState, narrativeContext, locationType);
    }
    
    // If the original function is not available, return null
    console.warn('Original decision generator not found, returning null');
    return null;
  };
  
  // Return the enhanced generator and the original for reference
  return {
    enhancedGenerator,
    originalGenerator: originalGenerateContextualDecision
  };
}

/**
 * Initialize the debug namespace with enhanced decision functions
 * 
 * This makes the enhanced decision capabilities available in the browser console
 * and allows DevTools to access them.
 */
export function initializeDecisionDebugTools() {
  // Ensure the bhgmDebug namespace exists
  if (!window.bhgmDebug) {
    window.bhgmDebug = {
      version: '1.0.0',
      triggerDecision: () => {},
      clearDecision: () => {},
      listLocations: () => [],
      sendCommand: () => {}
    };
  }
  
  // Add the decision generators
  if (window.bhgmDebug) {
    window.bhgmDebug.decisionGenerators = {
      getMode: getDecisionGenerationMode,
      setMode: setDecisionGenerationMode,
      generateDecision: generateEnhancedDecision
    };
  }
}