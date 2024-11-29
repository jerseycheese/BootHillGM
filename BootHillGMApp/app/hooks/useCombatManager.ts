import { useCallback, useRef, useState } from 'react';
import { Character } from '../types/character';
import { useCampaignState } from '../components/CampaignStateManager';
import { addCombatJournalEntry } from '../utils/JournalManager';
import { createStateProtection } from '../utils/stateProtection';
import { CombatState, ensureCombatState } from '../types/combat';

/**
 * Creates a clean, narrative-style message for combat conclusion.
 * Removes redundant roll information and formats the outcome in a
 * story-appropriate way.
 * 
 * @param winner - The winner of the combat ('player' or 'opponent')
 * @param summary - The combat summary containing the final action
 * @param playerName - The name of the player character
 * @param opponentName - The name of the opponent
 * @returns A formatted message describing the combat conclusion
 * 
 * Example output:
 * "The combat concludes as John strikes a decisive blow.
 * John emerges victorious, defeating Bandit."
 */
export const formatCombatEndMessage = (
  winner: 'player' | 'opponent',
  summary: string,
  playerName: string,
  opponentName: string
): string => {
  const victoryPhrase = winner === 'player'
    ? `${playerName} emerges victorious, defeating ${opponentName}`
    : `${opponentName} emerges victorious, defeating ${playerName}`;

  // Clean up the summary by removing roll information and ensure it ends with proper punctuation
  const cleanSummary = summary?.replace(/\[Roll:.*?\]/g, '').trim() || '';
  const summaryWithPunctuation = cleanSummary.endsWith('!') || cleanSummary.endsWith('.') 
    ? cleanSummary 
    : cleanSummary + '.';

  // Combine the victory phrase with the summary if available
  return cleanSummary 
    ? `${victoryPhrase} ${summaryWithPunctuation}`
    : `${victoryPhrase}.`;
};

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

  /**
   * Safely ends combat with state protection.
   * Handles victory/defeat message, journal updates, and state cleanup.
   * Provides error recovery if state updates fail.
   */
  const handleCombatEnd = useCallback(async (winner: 'player' | 'opponent', combatSummary: string) => {
    setIsProcessing(true);
    try {
      await stateProtection.current.withProtection('combat-end', async () => {
        // Get current names directly from state
        const playerName = state.character?.name || 'Player';
        const opponentName = state.opponent?.name || 'Unknown Opponent';
        
        // Format a concise end message
        const endMessage = formatCombatEndMessage(
          winner,
          '',  // We don't need the summary anymore
          playerName,
          opponentName
        );
        
        // Update narrative with just the victory message
        onUpdateNarrative(endMessage);
      
        const currentJournal = state.journal || [];
        dispatch({ 
          type: 'UPDATE_JOURNAL', 
          payload: addCombatJournalEntry(
            currentJournal,
            playerName,
            opponentName,
            winner === 'player' ? 'victory' : 'defeat',
            combatSummary // Use combatSummary for journal
          )
        });

        // Clear opponent state BEFORE setting combat inactive
        dispatch({ type: 'SET_OPPONENT', payload: null });
        
        // Then clear combat state
        dispatch({ type: 'SET_COMBAT_ACTIVE', payload: false });
        
        dispatch({ 
          type: 'UPDATE_COMBAT_STATE', 
          payload: ensureCombatState({
            isActive: false,
            combatType: null,
            winner: winner,
            summary: combatSummary,
            // Add these explicit nulling of combat-specific states
            brawling: undefined,
            weapon: undefined,
            selection: undefined
          })
        });
      });
    } catch (error) {
      console.error('Error ending combat:', error);
      onUpdateNarrative('There was an error processing the combat end. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, state, onUpdateNarrative]);

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
