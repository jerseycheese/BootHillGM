// /app/utils/initialization/initScenarios.ts
import { handleDirectAIGeneration } from './scenarios/directAIGeneration';
import { handleResetInitialization } from './scenarios/resetInitialization';
import { handleRestoredGameState } from './scenarios/restoredGameState';
import { handleFirstTimeInitialization } from './scenarios/firstTimeInitialization';

/**
 * This module exports all the initialization scenarios for the application
 * Each scenario is responsible for a specific initialization path:
 * 
 * - handleDirectAIGeneration: Uses pre-generated content for initialization
 * - handleResetInitialization: Handles resetting the game with new content
 * - handleRestoredGameState: Restores game from existing saved state
 * - handleFirstTimeInitialization: Handles first-time game initialization
 * 
 * The scenarios are used by useGameInitialization hook to properly
 * initialize the game state based on different conditions.
 */
export { 
  handleDirectAIGeneration,
  handleResetInitialization,
  handleRestoredGameState,
  handleFirstTimeInitialization
};