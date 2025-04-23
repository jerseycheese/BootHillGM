import { useCallback, useRef } from 'react';
import { Character } from '../types/character';
import { useGameState } from '../context/GameStateProvider';
import { CombatState, CombatLogEntry as LogEntry, initialCombatState } from '../types/state/combatState';
import { cleanCharacterName } from '../utils/combatUtils';
import { useCombatState } from './combat/useCombatState';
import { useCombatActions } from './combat/useCombatActions';
import { JournalUpdatePayload } from '../types/gameActions';
import { ActionTypes } from '../types/actionTypes';

// Simple state protection utility
interface StateProtection {
  withProtection: (id: string, action: () => Promise<void>) => Promise<void>;
}

/**
 * Custom hook for managing combat encounters.
 * 
 * This hook orchestrates combat state, actions, and synchronization with the global state.
 * 
 * @param onUpdateNarrative - Callback function to update the narrative text.
 * @returns An object containing combat-related state and functions.
 */
export const useCombatManager = ({ onUpdateNarrative }: { onUpdateNarrative: (text: string) => void }) => {
  const { dispatch, state } = useGameState(); // Use the correct hook
  
  // Safely extract player and opponent from state to avoid undefined errors
  const player = state?.character?.player;
  // The opponent is stored at the root level, not in the combat state
  // Access opponent via the character slice
  const opponent = state?.character?.opponent || null;
  
  const {
    isProcessing,
    setIsProcessing,
    isUpdatingRef
  } = useCombatState();
  
  // Create local replacements for the removed properties
  const combatQueueLength = useRef(0);
  
  // Create a simple state protection utility
  const stateProtection = useRef<StateProtection>({
    withProtection: async (id: string, action: () => Promise<void>) => {
      try {
        // Simple lock mechanism
        if (isUpdatingRef.current) {
          console.warn(`Combat state update already in progress for: ${id}`);
          return;
        }
        isUpdatingRef.current = true;
        
        // Execute the protected action
        await action();
      } finally {
        // Always release the lock
        isUpdatingRef.current = false;
      }
    }
  });

  const { handleStrengthChange, executeCombatRound } = useCombatActions();

  /**
   * Safely gets the round count from the combat state slice.
   */
  const getRoundCount = useCallback((): number => {
    // Access rounds directly from the combat slice in the main state
    return state?.combat?.rounds || 0;
  }, [state?.combat?.rounds]); // Depend on the specific state property

  /**
   * Safely ends combat with state protection.
   * Handles victory/defeat message, journal updates, and state cleanup.
   * Provides error recovery if state updates fail.
   */
  const handleCombatEnd = useCallback(
    async (winner: 'player' | 'opponent', combatResults: string) => {
      setIsProcessing(true);

      try {
        await stateProtection.current.withProtection('combat-end', async () => {
          const playerName = player?.name || 'Player';
          const opponentName = opponent?.name || 'Unknown Opponent';

          const cleanPlayerName = cleanCharacterName(playerName);
          const cleanOpponentName = cleanCharacterName(opponentName);
          const endMessage =
            winner === 'player'
              ? `${cleanPlayerName} emerges victorious, defeating ${cleanOpponentName}.`
              : `${cleanOpponentName} emerges victorious, defeating ${cleanPlayerName}.`;

          onUpdateNarrative(combatResults);
          onUpdateNarrative(endMessage);

          // Create a single journal entry with the required JournalUpdatePayload structure
          const journalEntry: JournalUpdatePayload = {
            id: `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'combat',
            content: endMessage,
            timestamp: Date.now(),
            narrativeSummary: `Combat between ${cleanPlayerName} and ${cleanOpponentName}`,
            combatants: {
              player: playerName,
              opponent: opponentName
            },
            outcome: winner === 'player' ? 'victory' : 'defeat'
          };

          dispatch({
            type: ActionTypes.UPDATE_JOURNAL,
            payload: journalEntry
          });

          // Use helper function to get round count safely
          const roundCount = getRoundCount();

          // Create an empty log entries array with proper typing
          const combatLog: LogEntry[] = [];

          // Construct updatedCombatState based on CombatState from state/combatState
          const updatedCombatState: Partial<CombatState> = {
            isActive: true,
            combatType: null,
            winner,
            rounds: roundCount,
            combatLog,
            // Add other properties from CombatState if needed, ensuring defaults
            playerCharacterId: player?.id, // Assuming player exists here
            opponentCharacterId: opponent?.id, // Assuming opponent exists here
            currentTurn: 'player', // Default turn? Or get from state?
            roundStartTime: Date.now(), // Or get from state?
            modifiers: { player: 0, opponent: 0 }, // Default modifiers
          };

          dispatch({
            type: ActionTypes.UPDATE_COMBAT_STATE,
            payload: updatedCombatState,
          });

          dispatch({ type: ActionTypes.SET_OPPONENT, payload: null }); // Clear opponent in character slice
          // Reset combat action handles setting isActive to false and resetting combat slice
          dispatch({ type: ActionTypes.END_COMBAT });
        });
      } catch (error) {
        console.error("Error in handleCombatEnd:", error);
        onUpdateNarrative(
          'There was an error processing the combat end. Please try again.'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [dispatch, player, opponent, onUpdateNarrative, setIsProcessing, getRoundCount]
  );

  /**
   * Initiates or restores a combat encounter.
   * Handles both new combat initialization and existing combat state restoration.
   *
   * @param newOpponent - The opponent character to fight against.
   * @param existingCombatState - Optional existing combat state to restore.
   */
  const initiateCombat = useCallback(
    async (
      newOpponent: Character,
      existingCombatState?: Partial<CombatState> // Use standard CombatState from state
    ) => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;

      try {
        if (!player) {
          onUpdateNarrative('No player character available to initiate combat.');
          return;
        }

        if (!newOpponent) {
          onUpdateNarrative('No opponent character available to initiate combat.');
          return;
        }

        // Moved inside the useCallback to prevent dependency issues

        // Update combat state to set isActive to true
        // Use namespaced type and spread existing state to satisfy type checker
        dispatch({ type: ActionTypes.SET_COMBAT_ACTIVE, payload: true }); // Use standardized action type
        dispatch({ type: ActionTypes.SET_OPPONENT, payload: newOpponent }); // Use standardized action type

        // Get rounds from the right property - using getRoundCount for a more robust approach
        const existingRounds = existingCombatState ? state?.combat?.rounds || 0 : 0; // Access rounds directly if state exists

        // Create an empty participants array with proper typing

        // Create an empty log entries array with proper typing
        const combatLog: LogEntry[] = [];

        // Construct the payload ensuring it's a complete CombatState object
        const combatStatePayload: CombatState = {
          // Start with initial state to ensure all fields are present
          ...initialCombatState,
          // Override with existing state if provided
          ...(existingCombatState || { /* Intentionally empty */ }),
          // Ensure core properties are set correctly
          isActive: true, // Starting combat always means active
          combatType: existingCombatState?.combatType ?? null, // Keep existing or null
          currentTurn: existingCombatState?.currentTurn ?? 'player', // Keep existing or default to player
          winner: existingCombatState?.winner ?? null, // Keep existing winner status
          rounds: existingRounds, // Use calculated existing rounds
          playerCharacterId: existingCombatState?.playerCharacterId ?? player.id,
          opponentCharacterId: existingCombatState?.opponentCharacterId ?? newOpponent.id,
          roundStartTime: existingCombatState?.roundStartTime ?? Date.now(),
          modifiers: existingCombatState?.modifiers ?? { player: 0, opponent: 0 },
          combatLog: existingCombatState?.combatLog ?? combatLog, // Use existing log or default empty
        };
        
        dispatch({
          type: ActionTypes.UPDATE_COMBAT_STATE,
          payload: combatStatePayload, // Use the correctly typed payload
        });
      } catch (error) {
        console.error('Error in initiateCombat:', error);
        onUpdateNarrative(
          'There was an error processing the combat initiation. Please try again.'
        );
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [dispatch, player, onUpdateNarrative, isUpdatingRef, state?.combat?.rounds]
  );

  /**
   * Retrieves the current opponent in combat.
   *
   * @returns The current opponent character or null if not in combat.
   */
  const getCurrentOpponent = useCallback(() => opponent, [opponent]);

  return {
    ...state,
    handleCombatEnd,
    handleStrengthChange,
    initiateCombat,
    getCurrentOpponent,
    executeCombatRound: () => executeCombatRound(handleCombatEnd),
    isProcessing,
    combatQueueLength: combatQueueLength.current,
    stateProtection: stateProtection.current
  };
};
