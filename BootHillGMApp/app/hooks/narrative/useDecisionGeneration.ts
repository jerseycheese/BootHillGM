/**
 * Hook for generating decisions based on narrative context
 */
import { useCallback, MutableRefObject } from 'react';
import { DecisionImportance, PlayerDecision } from '../../types/narrative.types';
import { NarrativeState } from '../../types/narrative.types';
import { detectPlayerNameFromText } from '../../utils/narrativeUtils';
import { GameState } from '../../types/gameState';
import { initialCharacterState } from '../../types/state/characterState';
import { initialInventoryState } from '../../types/state/inventoryState';
import { initialJournalState } from '../../types/state/journalState';
import { initialUIState } from '../../types/state/uiState';
import { CombatState } from '../../types/state';
import { DecisionContext } from './types/decisionTypes';

/**
 * Hook that provides functionality for generating AI decisions
 * 
 * @param state The narrative state
 * @param playerNameRef Reference to player name
 * @returns Functions for generating decisions
 */
export function useDecisionGeneration(
  state: NarrativeState,
  playerNameRef: MutableRefObject<string | null>
) {
  /**
   * Find key elements in the current narrative to use in the decision
   */
  const extractDecisionContext = useCallback((recentHistory: string[]): DecisionContext => {
    // Get the most recent 5 entries for context
    const contextEntries = recentHistory.slice(-5).filter(entry => 
      entry && typeof entry === 'string' &&
      !entry.startsWith('Game Event:') &&
      !entry.startsWith('Context:') &&
      !entry.includes('STORY_POINT:')
    );
    
    // Detect player name if not already set
    const playerName = playerNameRef.current || 
      detectPlayerNameFromText(contextEntries.join(' ')) || 
      'Cowboy'; // Default if not detected
    
    return {
      playerName,
      recentText: contextEntries.join('\n').substring(0, 1000), // Limit context length
      timestamp: Date.now()
    };
  }, [playerNameRef]);

  /**
   * Verify that a decision is relevant to the current narrative context
   */
  const verifyDecisionContext = useCallback((decision: PlayerDecision): boolean => {
    // Basic validation - just check for empty decision
    if (!decision?.prompt?.trim() || decision.options?.length === 0) {
      console.warn('Rejected empty decision from AI');
      return false;
    }
    return true;
  }, []);

  /**
   * Generate a contextually appropriate decision based on recent narrative
   */
  const generateContextualDecision = useCallback((): PlayerDecision => {
    // Get context for AI generation
    const context = extractDecisionContext(state.narrativeHistory || []);
    
    // Create simple fallback decision using context
    const promptText = `${context.recentText}\n\nWhat would ${context.playerName} like to do next?`;
    
    const options = [
      {
        id: `opt-explore-${Date.now()}`,
        text: 'Explore the area',
        impact: 'Look for interesting locations or people'
      },
      {
        id: `opt-inquire-${Date.now()}`,
        text: 'Ask questions',
        impact: 'Gather more information about the situation'
      },
      {
        id: `opt-leave-${Date.now()}`,
        text: 'Move on',
        impact: 'Continue to the next location'
      }
    ];

    return {
      id: `fallback-decision-${Date.now()}`,
      prompt: promptText,
      timestamp: Date.now(),
      options,
      context: context.recentText,
      importance: 'moderate' as DecisionImportance,
      aiGenerated: true
    };
  }, [state.narrativeHistory, extractDecisionContext]);

  /**
   * Generate an enhanced decision using AI
   */
  const generateEnhancedDecision = useCallback(async (
    context?: string, 
    importance: DecisionImportance = 'moderate'
  ): Promise<PlayerDecision | null> => {
    try {
      // Import the enhanced decision generator dynamically
      const { generateEnhancedDecision, setDecisionGenerationMode } = 
        await import('../../utils/contextualDecisionGenerator');
      
      // Force AI mode for better context awareness
      setDecisionGenerationMode('ai');
      
      // Create a complete GameState object
      const gameState: GameState = {
        currentPlayer: 'player',
        npcs: [],
        location: null,
        inventory: initialInventoryState,
        quests: [],
        gameProgress: 0,
        character: initialCharacterState,
        combat: {} as CombatState,
        journal: initialJournalState,
        narrative: state,
        ui: initialUIState,
        suggestedActions: [],
        isClient: true,
      };

      // Try to generate a decision using the AI generator
      const decision = await generateEnhancedDecision(
        gameState,
        state.narrativeContext,
        undefined,
        true
      );
      
      if (decision) {
        if (importance !== 'moderate') {
          decision.importance = importance;
        }
        return decision;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating enhanced decision:', error);
      return null;
    }
  }, [state]);

  return {
    extractDecisionContext,
    verifyDecisionContext,
    generateContextualDecision,
    generateEnhancedDecision
  };
}
