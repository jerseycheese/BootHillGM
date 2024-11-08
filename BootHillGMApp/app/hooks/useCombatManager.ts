import { useCallback, useEffect, useRef } from 'react';
import { Character } from '../types/character';
import { useCampaignState } from '../components/CampaignStateManager';
import { addCombatJournalEntry } from '../utils/JournalManager';

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
 * Interface defining the structure of combat state
 */
interface CombatState {
  playerStrength: number;
  opponentStrength: number;
  currentTurn: 'player' | 'opponent';
  combatLog: CombatLogEntry[];
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
 * - Supports restoration of existing combat state
 * 
 * @param onUpdateNarrative - Callback to update game narrative with combat events
 * @returns Combat state and handlers for managing combat encounters
 */
export const useCombatManager = ({ onUpdateNarrative }: UseCombatManagerProps): UseCombatManagerResult => {
  const { dispatch, state } = useCampaignState();
  const isUpdatingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Enhanced initialization effect with combat state restoration
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (state.isCombatActive && state.opponent && state.combatState) {
        // Update combat state with proper type conversion
        dispatch({
          type: 'UPDATE_COMBAT_STATE',
          payload: state.combatState
        });
      }
    }
  }, [state.isCombatActive, state.opponent, state.combatState, dispatch]);

  const handleCombatEnd = useCallback((winner: 'player' | 'opponent', combatSummary: string) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    try {
      const endMessage = winner === 'player' 
        ? "You have emerged victorious from the combat!" 
        : "You have been defeated in combat.";
    
      // Update narrative first
      onUpdateNarrative(`${endMessage}\n\n${combatSummary}\n\nWhat would you like to do now?`);
    
      // Update journal with all required parameters
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

      // Clear combat state in campaign state first
      dispatch({ type: 'SET_COMBAT_ACTIVE', payload: false });
      dispatch({ type: 'SET_OPPONENT', payload: null });
      
      // Reset combat state with default values
      dispatch({ 
        type: 'UPDATE_COMBAT_STATE', 
        payload: {
          playerStrength: 0,
          opponentStrength: 0,
          currentTurn: 'player' as const,
          combatLog: []
        }
      });
    } finally {
      isUpdatingRef.current = false;
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
      console.log('Combat Manager - Starting combat with:', {
        opponent: newOpponent,
        existingState: existingCombatState,
        currentState: {
          isCombatActive: state.isCombatActive,
          hasCombatState: !!state.combatState,
          hasOpponent: !!state.opponent
        }
      });

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
  }, [dispatch, state.isCombatActive, state.combatState, state.opponent, state.character]);

  /**
   * Retrieves the current opponent in combat.
   * 
   * @returns The current opponent character or null if not in combat
   */
  const getCurrentOpponent = useCallback(() => state.opponent, [state.opponent]);

  return {
    isCombatActive: state.isCombatActive,
    opponent: state.opponent,
    handleCombatEnd,
    handlePlayerHealthChange,
    initiateCombat,
    getCurrentOpponent,
    _debug: {
      currentState: { 
        isCombatActive: state.isCombatActive, 
        opponent: state.opponent 
      }
    }
  };
};
