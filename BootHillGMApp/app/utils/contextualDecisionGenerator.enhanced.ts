/**
 * Enhanced Contextual Decision Generator
 * 
 * This utility extends the existing template-based decision generator
 * with AI-powered contextual analysis. It maintains backward compatibility
 * while providing more sophisticated decision generation.
 */

import { 
  getContextualDecisionService 
} from '../services/ai/contextualDecisionService';
import { generateContextualDecision as generateTemplateDecision } from './contextualDecisionGenerator';
import { PlayerDecision, NarrativeContext } from '../types/narrative.types';
import { GameState } from '../types/gameState';
import { LocationType } from '../services/locationService';
import { v4 as uuidv4 } from 'uuid';
// Import the global declarations
import '../types/global.d';

// Decision generation modes
export type DecisionGenerationMode = 'template' | 'ai' | 'hybrid';

// Default to hybrid mode
let currentGenerationMode: DecisionGenerationMode = 'hybrid';

// Cache for pending decisions
let pendingDecision: PlayerDecision | null = null;

// Generation state
let isGeneratingDecision = false;

/**
 * Set the decision generation mode.
 * 
 * @param mode - The decision generation mode to use for future decisions. 
 *               Options: 'template' (preset templates only), 'ai' (AI-generated only),
 *               or 'hybrid' (AI with template fallbacks)
 */
export function setDecisionGenerationMode(mode: DecisionGenerationMode): void {
  currentGenerationMode = mode;
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`Decision generation mode set to: ${mode}`);
  }
}

/**
 * Get the current decision generation mode.
 * 
 * @returns The active decision generation mode ('template', 'ai', or 'hybrid')
 */
export function getDecisionGenerationMode(): DecisionGenerationMode {
  return currentGenerationMode;
}

/**
 * Check if the game state is ready for decisions.
 * 
 * This function validates that all required game state elements
 * are present and in the appropriate state for decision generation.
 * 
 * @param gameState - Current game state
 * @returns True if the game state is ready, false otherwise
 */
function isGameStateReadyForDecisions(gameState: GameState): boolean {
  // Must have a character
  if (!gameState.character) {
    return false;
  }
  
  // Must have some narrative history
  if (gameState.narrative.narrativeHistory.length < 2) {
    return false;
  }
  
  // Must not be in combat
  if (gameState.combatState?.isActive) {
    return false;
  }
  
  return true;
}

/**
 * Generate an enhanced contextual decision.
 * 
 * This function integrates AI-driven and template-based decision generation,
 * providing a seamless upgrade path from the existing system. It analyzes
 * narrative context to determine appropriate decision points and generates
 * decisions that feel natural within the game flow.
 * 
 * @param gameState - Current game state with narrative and character data
 * @param narrativeContext - Optional narrative context override
 * @param locationType - Optional location type to contextualize the decision
 * @param forceGeneration - Whether to skip detection threshold and force generation
 * @returns Promise resolving to a PlayerDecision or null if generation fails
 */
export async function generateEnhancedDecision(
  gameState: GameState,
  narrativeContext?: NarrativeContext,
  locationType?: LocationType,
  forceGeneration: boolean = false
): Promise<PlayerDecision | null> {
  try {
    // Prevent multiple concurrent generations
    if (isGeneratingDecision) {
      return null;
    }
    
    isGeneratingDecision = true;
    
    // Check if the game state is ready for decisions
    if (!forceGeneration && !isGameStateReadyForDecisions(gameState)) {
      isGeneratingDecision = false;
      return null;
    }
    
    // Check for a pending decision from previous async generation
    if (pendingDecision) {
      const decision = pendingDecision;
      pendingDecision = null;
      isGeneratingDecision = false;
      return decision;
    }
    
    // Make sure we have a character to work with
    if (!gameState.character) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('No character found in gameState, cannot generate decision');
      }
      isGeneratingDecision = false;
      return null;
    }
    
    // Generate decision based on the selected mode
    switch (currentGenerationMode) {
      case 'ai': {
        // Use AI-only generation
        const service = getContextualDecisionService();
        const decision = await service.generateDecision(
          gameState.narrative,
          gameState.character,
          gameState,
          forceGeneration
        );
        isGeneratingDecision = false;
        return decision;
      }
      
      case 'template': {
        // Use template-based generation only
        const decision = generateTemplateDecision(
          gameState,
          narrativeContext || gameState.narrative.narrativeContext,
          locationType
        );
        isGeneratingDecision = false;
        return decision;
      }
      
      case 'hybrid':
      default: {
        // Try AI generation first
        try {
          const service = getContextualDecisionService();
          
          // If force generation is enabled, skip detection check
          if (forceGeneration) {
            const decision = await service.generateDecision(
              gameState.narrative,
              gameState.character,
              gameState,
              true
            );
            isGeneratingDecision = false;
            return decision;
          }
          
          // Check if we should present a decision
          const detectionResult = service.detectDecisionPoint(
            gameState.narrative,
            gameState.character,
            gameState
          );
          
          // Store detection score in debug object for visualization
          if (typeof window !== 'undefined' && window.bhgmDebug?.decisions) {
            window.bhgmDebug.decisions.lastDetectionScore = detectionResult.score;
          }
          
          if (process.env.NODE_ENV !== 'production') {
            console.debug(`Decision detection score: ${detectionResult.score} - ${detectionResult.reason}`);
          }
          
          if (detectionResult.shouldPresent) {
            // Generate AI-driven decision
            const aiDecision = await service.generateDecision(
              gameState.narrative,
              gameState.character,
              gameState
            );
            
            isGeneratingDecision = false;
            if (aiDecision) {
              return aiDecision;
            }
          }
          
          // Fall back to template-based generation
          const templateDecision = generateTemplateDecision(
            gameState,
            narrativeContext || gameState.narrative.narrativeContext,
            locationType
          );
          
          isGeneratingDecision = false;
          return templateDecision;
        } catch (error) {
          console.error('AI generation failed, falling back to templates:', error);
          const fallbackDecision = generateTemplateDecision(
            gameState,
            narrativeContext || gameState.narrative.narrativeContext,
            locationType
          );
          isGeneratingDecision = false;
          return fallbackDecision;
        }
      }
    }
  } catch (error) {
    console.error('Error in generateEnhancedDecision:', error);
    isGeneratingDecision = false;
    
    // Last resort fallback: return a simple decision
    return {
      id: `fallback-${uuidv4()}`,
      prompt: 'What would you like to do?',
      timestamp: Date.now(),
      location: locationType,
      options: [
        {
          id: `opt1-${uuidv4()}`,
          text: 'Continue',
          impact: 'Proceed with the current course of action.',
          tags: ['default']
        },
        {
          id: `opt2-${uuidv4()}`,
          text: 'Try something else',
          impact: 'Explore alternative approaches.',
          tags: ['default']
        }
      ],
      context: 'Fallback decision due to error',
      importance: 'moderate',
      characters: [],
      aiGenerated: false
    };
  }
}

/**
 * Enhanced version of the original generateContextualDecision function.
 * 
 * This provides a drop-in replacement for the existing function while
 * adding AI capabilities behind the scenes. It maintains the same synchronous
 * API signature while initiating async AI generation in the background.
 * 
 * @param gameState - Current game state
 * @param narrativeContext - Optional narrative context
 * @param locationType - Optional location type 
 * @returns PlayerDecision or null (synchronous API)
 */
export function generateEnhancedContextualDecision(
  gameState: GameState,
  narrativeContext?: NarrativeContext,
  locationType?: LocationType
): PlayerDecision | null {
  // Don't generate decisions for empty game states
  if (!isGameStateReadyForDecisions(gameState)) {
    return null;
  }
  
  // First, try the original function to get an immediate result
  const templateDecision = generateTemplateDecision(
    gameState,
    narrativeContext || gameState.narrative.narrativeContext,
    locationType
  );
  
  // Start async AI generation in the background only if not already generating
  if (!isGeneratingDecision) {
    generateEnhancedDecision(gameState, narrativeContext, locationType)
      .then(decision => {
        if (decision) {
          // Cache the decision for next call
          pendingDecision = decision;
          if (process.env.NODE_ENV !== 'production') {
            console.debug('AI decision cached for next retrieval:', decision.id);
          }
        }
      })
      .catch(error => {
        console.error('Background AI decision generation failed:', error);
      });
  }
  
  // Return the template decision for now
  return templateDecision;
}

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
      },
      clearDecision: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Decision cleared');
        }
      },
      listLocations: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Listing locations');
        }
        return [];
      },
      // Debug command handler
      sendCommand: (commandType: string, data?: unknown) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`Debug command: ${commandType}`, data);
        }
      }
    };
    
    // Extend with decision debug functions - FIXED: Check if bhgmDebug exists
    if (window.bhgmDebug) {
      window.bhgmDebug.decisions = {
        getMode: getDecisionGenerationMode,
        setMode: setDecisionGenerationMode,
        generateDecision: generateEnhancedDecision,
        pendingDecision: null,
        service: getContextualDecisionService(),
        lastDetectionScore: 0,
        isGenerating: () => isGeneratingDecision
      };
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Decision debug tools initialized');
    }
  }
}