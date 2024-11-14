import { useCallback, useRef, useState } from 'react';
import { Character } from '../types/character';
import { useCampaignState } from '../components/CampaignStateManager';
import { addCombatJournalEntry } from '../utils/JournalManager';
import { createStateProtection } from '../utils/stateProtection';
import { CombatState, ensureCombatState } from '../types/combat';

/**
 * Manages combat state and operations with protection against race conditions.
 * Uses StateProtection to ensure combat operations execute safely and in sequence.
 * 
 * Features:
 * - Protected state updates during combat
 * - Operation queueing for concurrent requests
 * - Automatic state cleanup after combat
 * - Error recovery with user feedback
 */
export const useCombatManager = ({ onUpdateNarrative }: { onUpdateNarrative: (text: string) => void }) => {
  const { dispatch, state } = useCampaignState();
  const stateProtection = useRef(createStateProtection());
  const [isProcessing, setIsProcessing] = useState(false);
  const isUpdatingRef = useRef(false);
  const characterNameRef = useRef(state.character?.name);
  const opponentNameRef = useRef(state.opponent?.name);

  // Update refs when character or opponent changes
  if (characterNameRef.current !== state.character?.name) {
    characterNameRef.current = state.character?.name;
  }
  if (opponentNameRef.current !== state.opponent?.name) {
    opponentNameRef.current = state.opponent?.name;
  }

  /**
   * Safely ends combat with state protection.
   * Handles victory/defeat message, journal updates, and state cleanup.
   * Provides error recovery if state updates fail.
   */
  const handleCombatEnd = useCallback(async (winner: 'player' | 'opponent', combatSummary: string) => {
    setIsProcessing(true);
    try {
      await stateProtection.current.withProtection('combat-end', async () => {
        const endMessage = winner === 'player' 
          ? "You have emerged victorious from the combat!" 
          : "You have been defeated in combat.";
      
        onUpdateNarrative(`${endMessage}\n\n${combatSummary}\n\nWhat would you like to do now?`);
      
        const currentJournal = state.journal || [];
        dispatch({ 
          type: 'UPDATE_JOURNAL', 
          payload: addCombatJournalEntry(
            currentJournal,
            characterNameRef.current || 'Player',
            opponentNameRef.current || 'Unknown Opponent',
            winner === 'player' ? 'victory' : 'defeat',
            combatSummary
          )
        });

        dispatch({ type: 'SET_COMBAT_ACTIVE', payload: false });
        dispatch({ type: 'SET_OPPONENT', payload: null });
        
        dispatch({ 
          type: 'UPDATE_COMBAT_STATE', 
          payload: ensureCombatState({
            isActive: false,
            combatType: null,
            winner: winner,
            summary: combatSummary
          })
        });
      });
    } catch (error) {
      console.error('Error ending combat:', error);
      onUpdateNarrative('There was an error processing the combat end. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, state.journal, onUpdateNarrative]);

  /**
   * Updates the player's strength during combat.
   * Dispatches the new strength value to the campaign state.
   * 
   * @param newStrength - The updated strength value for the player
   */
  const handlePlayerHealthChange = useCallback((newStrength: number) => {
    if (!isUpdatingRef.current && state.character) {
      const currentAttributes = state.character.attributes;
      dispatch({
        type: 'UPDATE_CHARACTER',
        payload: { 
          attributes: { ...currentAttributes, strength: Number(newStrength) }
        }
      });
    }
  }, [dispatch, state.character]);

  /**
   * Initiates or restores a combat encounter.
   * Handles both new combat initialization and existing combat state restoration.
   * 
   * @param newOpponent - The opponent character to fight against
   * @param existingCombatState - Optional existing combat state to restore
   */
  const initiateCombat = useCallback((newOpponent: Character, existingCombatState?: Partial<CombatState>) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      // Set combat active first
      dispatch({ type: 'SET_COMBAT_ACTIVE', payload: true });
      
      // Set opponent next
      dispatch({ type: 'SET_OPPONENT', payload: newOpponent });

      // Initialize or restore combat state
      const playerStrength = state.character?.attributes.strength ?? 0;
      const combatState = ensureCombatState({
        ...existingCombatState,
        isActive: true,
        combatType: null, // Will be selected later
        playerStrength,
        opponentStrength: newOpponent.attributes.strength,
        currentTurn: 'player',
        winner: null,
        summary: null
      });

      // Update combat state with proper type conversion
      dispatch({
        type: 'UPDATE_COMBAT_STATE',
        payload: combatState
      });
    } finally {
      isUpdatingRef.current = false;
    }
  }, [dispatch, state.character?.attributes]);

  /**
   * Retrieves the current opponent in combat.
   * 
   * @returns The current opponent character or null if not in combat
   */
  const getCurrentOpponent = useCallback(() => state.opponent, [state.opponent]);

  return {
    ...state,
    handleCombatEnd,
    handlePlayerHealthChange,
    initiateCombat,
    getCurrentOpponent,
    isProcessing,
    combatQueueLength: stateProtection.current.getQueueLength('combat-end')
  };
};
