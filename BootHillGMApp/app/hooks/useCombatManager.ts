import { useCallback, useRef, useState } from 'react';
import { Character } from '../types/character';
import { useCampaignState } from '../components/CampaignStateManager';
import { addCombatJournalEntry } from '../utils/JournalManager';
import { createStateProtection } from '../utils/stateProtection';

interface CombatLogEntry {
  text: string;
  type: 'hit' | 'miss' | 'critical' | 'info';
  timestamp: number;
}

/**
 * Interface defining the return value of the useCombatManager hook
 */
interface UseCombatManagerResult {
  isCombatActive: boolean;
  opponent: Character | null;
  handleCombatEnd: (winner: 'player' | 'opponent', combatSummary: string) => void;
  handlePlayerHealthChange: (newHealth: number) => void;
  initiateCombat: (newOpponent: Character, existingCombatState?: CombatState) => void;
  getCurrentOpponent: () => Character | null;
  isProcessing: boolean;
  combatQueueLength: number;
}

/**
 * Props required by the useCombatManager hook
 */
interface UseCombatManagerProps {
  onUpdateNarrative: (text: string) => void;
}

/**
 * Interface defining the structure of combat state
 */
interface CombatState {
  playerStrength: number;
  opponentStrength: number;
  currentTurn: 'player' | 'opponent';
  combatLog: CombatLogEntry[];
}

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
export const useCombatManager = ({ onUpdateNarrative }: UseCombatManagerProps): UseCombatManagerResult => {
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
        const endMessage = winner === 'player' 
          ? "You have emerged victorious from the combat!" 
          : "You have been defeated in combat.";
      
        onUpdateNarrative(`${endMessage}\n\n${combatSummary}\n\nWhat would you like to do now?`);
      
        dispatch({ 
          type: 'UPDATE_JOURNAL', 
          payload: addCombatJournalEntry(
            state.journal || [],
            state.character?.name || 'Player',
            state.opponent?.name || 'Unknown Opponent',
            winner === 'player' ? 'victory' : 'defeat',
            combatSummary
          )
        });

        dispatch({ type: 'SET_COMBAT_ACTIVE', payload: false });
        dispatch({ type: 'SET_OPPONENT', payload: null });
        
        dispatch({ 
          type: 'UPDATE_COMBAT_STATE', 
          payload: {
            playerStrength: 0,
            opponentStrength: 0,
            currentTurn: 'player' as const,
            combatLog: []
          }
        });
      });
    } catch (error) {
      console.error('Error ending combat:', error);
      onUpdateNarrative('There was an error processing the combat end. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, onUpdateNarrative, state.character?.name, state.opponent?.name, state.journal]);

  /**
   * Updates the player's strength during combat.
   * Dispatches the new strength value to the campaign state.
   * 
   * @param newStrength - The updated strength value for the player
   */
  const handlePlayerHealthChange = useCallback((newStrength: number) => {
    if (!isUpdatingRef.current && state.character) {
      dispatch({
        type: 'UPDATE_CHARACTER',
        payload: { 
          ...state.character,
          attributes: { ...state.character.attributes, strength: Number(newStrength) }
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
  const initiateCombat = useCallback((newOpponent: Character, existingCombatState?: CombatState) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {

      // Set combat active first
      dispatch({ type: 'SET_COMBAT_ACTIVE', payload: true });
      
      // Set opponent next
      dispatch({ type: 'SET_OPPONENT', payload: newOpponent });

      // Initialize or restore combat state
      const combatState = existingCombatState || {
        playerStrength: state.character ? state.character.attributes.strength : 0,
        opponentStrength: newOpponent.attributes.strength,
        currentTurn: 'player' as const,
        combatLog: []
      };

      // Update combat state with proper type conversion
      dispatch({
        type: 'UPDATE_COMBAT_STATE',
        payload: combatState
      });
    } finally {
      isUpdatingRef.current = false;
    }
  }, [dispatch, state.character]);

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
