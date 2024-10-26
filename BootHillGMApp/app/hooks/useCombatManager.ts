import { useState, useCallback, useEffect } from 'react';
import { Character } from '../types/character';
import { useCampaignState } from '../components/CampaignStateManager';
import { addCombatJournalEntry } from '../utils/JournalManager';

/**
 * Interface defining the return value of the useCombatManager hook
 */
interface UseCombatManagerResult {
  isCombatActive: boolean;
  opponent: Character | null;
  handleCombatEnd: (winner: 'player' | 'opponent', combatSummary: string) => void;
  handlePlayerHealthChange: (newHealth: number) => void;
  initiateCombat: (newOpponent: Character) => void;
  getCurrentOpponent: () => Character | null;
  _debug: {
    currentState: {
      isCombatActive: boolean;
      opponent: Character | null;
    }
  };
}

/**
 * Props required by the useCombatManager hook
 */
interface UseCombatManagerProps {
  onUpdateNarrative: (text: string) => void;
}

/**
 * Hook to manage combat state within the game session.
 * Uses campaign state for persistence and maintains combat status across page navigation.
 * 
 * Key features:
 * - Syncs combat state with campaign state for persistence
 * - Manages opponent data and combat status
 * - Handles combat initiation and conclusion
 * - Updates player health during combat
 * - Maintains debug information for development
 * 
 * @param onUpdateNarrative - Callback to update game narrative with combat events
 * @returns Combat state and handlers for managing combat encounters
 */
export const useCombatManager = ({ onUpdateNarrative }: UseCombatManagerProps): UseCombatManagerResult => {
  const { dispatch, state } = useCampaignState();

  // Initialize from persisted campaign state to maintain combat across page loads
  const [isCombatActive, setIsCombatActive] = useState(state.isCombatActive || false);
  const [opponent, setOpponent] = useState<Character | null>(state.opponent);

  // Sync local state with campaign state for persistence
  useEffect(() => {
    if (state.isCombatActive !== isCombatActive) {
      setIsCombatActive(state.isCombatActive);
    }
    if (state.opponent !== opponent) {
      setOpponent(state.opponent);
    }
  }, [state.isCombatActive, state.opponent, isCombatActive, opponent]);

  /**
   * Handles the conclusion of a combat encounter.
   * Updates game state, narrative, and journal with combat results.
   * 
   * @param winner - Indicates whether the player or opponent won the combat
   * @param combatSummary - Detailed summary of the combat encounter
   */
  const handleCombatEnd = useCallback((winner: 'player' | 'opponent', combatSummary: string) => {
    
    setIsCombatActive(false);
    setOpponent(null);
    
    const endMessage = winner === 'player' 
      ? "You have emerged victorious from the combat!" 
      : "You have been defeated in combat.";
  
    onUpdateNarrative(`${endMessage}\n\n${combatSummary}\n\nWhat would you like to do now?`);
  
    dispatch({ 
      type: 'UPDATE_JOURNAL', 
      payload: addCombatJournalEntry(combatSummary)
    });

    dispatch({ type: 'SET_COMBAT_ACTIVE', payload: false });
    dispatch({ type: 'SET_OPPONENT', payload: null });
  }, [dispatch, onUpdateNarrative]);

  /**
   * Updates the player's health during combat.
   * Dispatches the new health value to the campaign state.
   * 
   * @param newHealth - The updated health value for the player
   */
  const handlePlayerHealthChange = useCallback((newHealth: number) => {
    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: { health: newHealth }
    });
  }, [dispatch]);

  /**
   * Initiates a new combat encounter with a specified opponent.
   * Updates both local and campaign state to reflect combat status.
   * 
   * @param newOpponent - The character to initiate combat with
   */
  const initiateCombat = useCallback((newOpponent: Character) => {
    
    setIsCombatActive(true);
    setOpponent(newOpponent);
    dispatch({ type: 'SET_COMBAT_ACTIVE', payload: true });
    dispatch({ type: 'SET_OPPONENT', payload: newOpponent });
  }, [dispatch]);

  /**
   * Retrieves the current opponent in combat.
   * 
   * @returns The current opponent character or null if not in combat
   */
  const getCurrentOpponent = useCallback(() => opponent, [opponent]);

  return {
    isCombatActive,
    opponent,
    handleCombatEnd,
    handlePlayerHealthChange,
    initiateCombat,
    getCurrentOpponent,
    _debug: {
      currentState: { isCombatActive, opponent }
    }
  };
};
