/**
 * Type definitions to extend the Window interface with Boot Hill GM's debugging tools
 */

import { PlayerDecision } from './narrative.types';
import { GameState } from './gameState';
import { LocationType } from '../services/locationService';
import { DecisionGenerationMode } from '../utils/contextualDecisionGenerator.enhanced';
import { ContextualDecisionService } from '../services/ai/contextualDecisionService';

declare global {
  interface Window {
    /**
     * Boot Hill GM Debug namespace
     */
    bhgmDebug?: {
      /**
       * Current game state getter
       */
      getGameState?: () => GameState;
      
      /**
       * Function to trigger a contextual decision
       */
      triggerDecision?: (locationType?: LocationType) => void;
      
      /**
       * Function to trigger an AI-enhanced contextual decision
       */
      triggerAIDecision?: (locationType?: LocationType) => void;
      
      /**
       * Function to clear the current decision
       */
      clearDecision?: () => void;
      
      /**
       * Function to list available locations
       */
      listLocations?: () => string[];
      
      /**
       * Function to record locations (for debugging)
       */
      recordLocations?: () => void;
      
      /**
       * Function to process raw decision data
       */
      processRawDecision?: () => PlayerDecision | null;
      
      /**
       * Current decision displayed to the player
       */
      currentDecision?: PlayerDecision | null;
      
      /**
       * Version information
       */
      version?: string;
      
      /**
       * Send debug command
       */
      sendCommand?: (commandType: string, data?: unknown) => void;
      
      /**
       * AI decision system controls and state
       */
      decisions?: {
        /**
         * Get current decision generation mode
         */
        getMode: () => DecisionGenerationMode;
        
        /**
         * Set decision generation mode
         */
        setMode: (mode: DecisionGenerationMode) => void;
        
        /**
         * Generate a decision using the enhanced system
         */
        generateDecision: (
          gameState: GameState,
          narrativeContext?: Record<string, unknown>,
          locationType?: LocationType,
          forceGeneration?: boolean
        ) => Promise<PlayerDecision | null>;
        
        /**
         * Last decision detection score
         */
        lastDetectionScore?: number;
        
        /**
         * Cached pending decision
         */
        pendingDecision: PlayerDecision | null;
        
        /**
         * Direct access to the contextual decision service
         */
        service: ContextualDecisionService;
      };
    }
  }
}

export { /* Intentionally empty */ };