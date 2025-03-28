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
import { PlayerDecision } from '../types/narrative/decision.types';
import { NarrativeContext } from '../types/narrative/context.types';
import { GameState } from '../types/gameState';
import { LocationType } from '../services/locationService';
import { v4 as uuidv4 } from 'uuid';
// Import the global declarations
import '../types/global.d';
import { Character } from '../types/character';

// Decision generation modes
export type DecisionGenerationMode = 'template' | 'ai' | 'hybrid';

// Default to AI mode to prioritize context-awareness
let currentGenerationMode: DecisionGenerationMode = 'ai';

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
  
  // Must have player character
  if (!gameState.character.player) {
    return false;
  }
  
  // Must have some narrative history
  if (gameState.narrative.narrativeHistory.length < 2) {
    return false;
  }
  
  // Must not be in combat
  if (gameState.combat?.isActive) {
    return false;
  }
  
  return true;
}

/**
 * Get the latest game state from debug tools if available
 * 
 * This helper ensures we always work with the most up-to-date state
 * when generating decisions, fixing the stale context issue (#210)
 * 
 * @param originalState - The state initially passed to the function
 * @returns The most up-to-date game state available
 */
function getRefreshedGameState(originalState: GameState): GameState {
  // In browser environment, try to get fresh state from debug tools
  if (typeof window !== 'undefined' && window.bhgmDebug?.getState) {
    try {
      const freshState = window.bhgmDebug.getState();
      
      // If we got a valid state, update the narrative portion
      if (freshState && freshState.narrative) {
        return {
          ...originalState,
          narrative: freshState.narrative
        };
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to get fresh state from debug tools:', error);
      }
    }
  }
  
  // Fall back to the original state
  return originalState;
}

/**
 * Safely get the player character, ensuring it's not null
 * This is a helper to handle the Character | null type
 * 
 * @param gameState - Current game state
 * @returns Player character or a default character if none exists
 */
function getSafePlayerCharacter(gameState: GameState): Character {
  if (!gameState.character || !gameState.character.player) {
    // Return a minimally valid Character to satisfy the type system
    // This should rarely happen since we check isGameStateReadyForDecisions first
    return {
      id: 'default-player',
      name: 'Player',
      isNPC: false,
      isPlayer: true,
      inventory: { items: [] },
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
        experience: 0
      },
      minAttributes: {
        speed: 1,
        gunAccuracy: 1,
        throwingAccuracy: 1,
        strength: 8,
        baseStrength: 8,
        bravery: 1,
        experience: 0
      },
      maxAttributes: {
        speed: 20,
        gunAccuracy: 20,
        throwingAccuracy: 20,
        strength: 20,
        baseStrength: 20,
        bravery: 20,
        experience: 11
      },
      wounds: [],
      isUnconscious: false
    };
  }
  
  return gameState.character.player;
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
    
    // IMPORTANT FIX: Always get a fresh narrative state from the game state
    // This ensures we're not using stale context (fixes issue #210)
    const freshGameState = getRefreshedGameState(gameState);
    
    // Log what we're working with in development
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Generating decision with narrative history length:', 
        freshGameState.narrative.narrativeHistory.length);
      
      if (freshGameState.narrative.narrativeHistory.length > 0) {
        console.debug('Latest narrative entry:', 
          freshGameState.narrative.narrativeHistory[freshGameState.narrative.narrativeHistory.length - 1]);
      }
    }
    
    // Check if the game state is ready for decisions
    if (!forceGeneration && !isGameStateReadyForDecisions(freshGameState)) {
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
    
    // Generate decision based on the selected mode
    switch (currentGenerationMode) {
      case 'ai': {
        // Use AI-only generation
        const service = getContextualDecisionService();
        // Get a safe player character that's guaranteed not to be null
        const playerCharacter = getSafePlayerCharacter(freshGameState);
        
        const decision = await service.generateDecision(
          freshGameState.narrative,
          playerCharacter, // Now we're passing a non-null Character
          freshGameState,
          forceGeneration
        );
        isGeneratingDecision = false;
        return decision;
      }
      
      case 'template': {
        // Use template-based generation only
        const decision = generateTemplateDecision(
          freshGameState,
          narrativeContext || freshGameState.narrative.narrativeContext,
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
          // Get a safe player character that's guaranteed not to be null
          const playerCharacter = getSafePlayerCharacter(freshGameState);
          
          // If force generation is enabled, skip detection check
          if (forceGeneration) {
            const decision = await service.generateDecision(
              freshGameState.narrative,
              playerCharacter, // Now we're passing a non-null Character
              freshGameState,
              true
            );
            isGeneratingDecision = false;
            return decision;
          }
          
          // Check if we should present a decision
          const detectionResult = service.detectDecisionPoint(
            freshGameState.narrative,
            playerCharacter, // Now we're passing a non-null Character
            freshGameState
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
              freshGameState.narrative,
              playerCharacter, // Now we're passing a non-null Character
              freshGameState
            );
            
            isGeneratingDecision = false;
            if (aiDecision) {
              return aiDecision;
            }
          }
          
          // Fall back to template-based generation
          const templateDecision = generateTemplateDecision(
            freshGameState,
            narrativeContext || freshGameState.narrative.narrativeContext,
            locationType
          );
          
          isGeneratingDecision = false;
          return templateDecision;
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('AI generation failed, falling back to templates:', error);
          }
          const fallbackDecision = generateTemplateDecision(
            freshGameState,
            narrativeContext || freshGameState.narrative.narrativeContext,
            locationType
          );
          isGeneratingDecision = false;
          return fallbackDecision;
        }
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error in generateEnhancedDecision:', error);
    }
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
  // Get fresh state first (fix for issue #210)
  const freshGameState = getRefreshedGameState(gameState);
  
  // Don't generate decisions for empty game states
  if (!isGameStateReadyForDecisions(freshGameState)) {
    return null;
  }
  
  // First, try the original function to get an immediate result
  const templateDecision = generateTemplateDecision(
    freshGameState,
    narrativeContext || freshGameState.narrative.narrativeContext,
    locationType
  );
  
  // Start async AI generation in the background only if not already generating
  if (!isGeneratingDecision) {
    generateEnhancedDecision(freshGameState, narrativeContext, locationType)
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
        if (process.env.NODE_ENV !== 'production') {
          console.error('Background AI decision generation failed:', error);
        }
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
    
    // Extend with decision debug functions - already properly typed in global.d.ts
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