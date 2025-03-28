import { useCallback } from 'react';
import { GameState } from '../types/gameState';
import { initialState as initialGameState } from '../types/initialState';
import { initialNarrativeState } from '../types/narrative.types';
import { getAIResponse } from '../services/ai/gameService';
import { ExtendedGameState } from '../types/extendedState';
import { GameEngineAction } from '../types/gameActions';

/**
 * Hook for cleaning up and resetting the game state.
 * Preserves character identity while resetting gameplay state.
 * 
 * @param {GameState} state - Current game state
 * @param {React.Dispatch<GameEngineAction>} dispatch - Game state dispatch function
 * @returns {Function} Cleanup function to reset the game state
 */
export const useStateCleanup = (state: GameState, dispatch: React.Dispatch<GameEngineAction>) => {
  const cleanupState = useCallback(async () => {
    // Set a flag in sessionStorage to indicate that a new character is being initialized.
    // This prevents the auto-save functionality from triggering during the reset process.
    sessionStorage.setItem('initializing_new_character', 'true');

    // Remove any existing saved game state from localStorage.
    localStorage.removeItem('campaignState');

    // Create a new game state object, starting with the initial game state.
    const cleanState: GameState = {
      ...initialGameState,
      isClient: true, // Ensure this flag is set
      narrative: initialNarrativeState,
    };

    // If a character already exists (i.e., this is not the very first game load),
    // preserve the character's identity (ID, name, etc.) but reset their health-related attributes.
    if (state.character?.player) {
      cleanState.character = {
        ...state.character, // Keep structure
        player: {
          ...state.character.player, // Keep ID, name, etc.
          // Reset attributes that are affected by gameplay:
          attributes: {
            ...state.character.player.attributes, // Keep other attributes
            strength: state.character.player.attributes.baseStrength, // Reset strength to base
          },
          wounds: [], // Clear all wounds
          isUnconscious: false, // Reset unconscious status
        },
        opponent: null, // Clear opponent
      };
    }

    // After resetting the character and game state, fetch an initial narrative from the AI.
    // This provides a starting point for the new game session.
    if (state.character?.player) {
      try {
        const response = await getAIResponse(
          `Initialize a new game session for ${state.character.player.name}. Describe their current situation and location in detail. Include suggestions for what they might do next.`,
          "", // No journal context for the initial narrative
          state.inventory?.items || []
        );
        cleanState.narrative = {
          ...initialNarrativeState,
          narrativeHistory: [response.narrative],
        };

      } catch (error) {
        console.error('Error fetching initial narrative:', error);
        cleanState.narrative = {
          ...initialNarrativeState,
          narrativeHistory: ['Error initializing narrative. Please try again.'],
        };
      }
    }

    // Create extended state version with backward compatibility fields
    // Ensure opponent is never undefined
    const extendedCleanState: ExtendedGameState = {
      ...cleanState,
      opponent: null, // Ensure opponent is never undefined
      combatState: undefined,
      entries: []
    };

    // Dispatch an action to update the game state with the cleaned state.
    dispatch({ type: 'SET_STATE', payload: extendedCleanState });
  }, [dispatch, state.character, state.inventory]);

  return cleanupState;
};
