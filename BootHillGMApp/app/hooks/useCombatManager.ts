import { useCallback } from 'react';
import { Character } from '../types/character';
import { useCampaignState } from '../components/CampaignStateManager';
import { DefaultWeapons } from '../data/defaultWeapons';
import { addCombatJournalEntry } from '../utils/JournalManager';
import { CombatState as CombatStateFromCombat, ensureCombatState, CombatParticipant, LogEntry, BrawlingState, WeaponCombatState } from '../types/combat';
import { cleanCharacterName } from '../utils/combatUtils';
import { useCombatState } from './combat/useCombatState';
import { useCombatActions } from './combat/useCombatActions';
import { InventoryItem } from '../types/item.types';
import { UniversalCombatState } from '../types/combatStateAdapter';

/**
 * Custom hook for managing combat encounters.
 * 
 * This hook orchestrates combat state, actions, and synchronization with the global state.
 * 
 * @param onUpdateNarrative - Callback function to update the narrative text.
 * @returns An object containing combat-related state and functions.
 */
export const useCombatManager = ({ onUpdateNarrative }: { onUpdateNarrative: (text: string) => void }) => {
  const { dispatch, state, player, opponent, inventory } = useCampaignState();
  const {
    isProcessing,
    setIsProcessing,
    isUpdatingRef,
    combatQueueLength,
    stateProtection
  } = useCombatState();

  const { handleStrengthChange, executeCombatRound } = useCombatActions();

  /**
   * Safely gets the round count from combat state regardless of structure
   * This handles both interfaces: CombatState from combat.ts and from state/combatState.ts
   */
  const getRoundCount = useCallback((combatState: unknown): number => {
    if (!combatState) return 0;
    
    // Try accessing it as a property using type narrowing
    if (typeof combatState === 'object' && combatState !== null) {
      // Check for rounds property (from combat.ts)
      if ('rounds' in combatState && typeof combatState.rounds === 'number') {
        return combatState.rounds;
      }
      
      // Check for currentRound property (from state/combatState.ts)
      if ('currentRound' in combatState && typeof combatState.currentRound === 'number') {
        return combatState.currentRound;
      }
    }
    
    // Default to 0 if neither property exists
    return 0;
  }, []);

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

          dispatch({
            type: 'UPDATE_JOURNAL',
            payload: addCombatJournalEntry(
              state.journal.entries,
              playerName,
              opponentName,
              winner === 'player' ? 'victory' : 'defeat',
              endMessage
            ),
          });

          const initialPlayerStrength = player?.attributes?.strength || 0;
          const currentPlayerStrength = player?.attributes?.strength || 0;
          const initialOpponentStrength = opponent?.attributes?.strength || 0;
          const currentOpponentStrength = opponent?.attributes?.strength || 0;

          // Use helper function to get round count safely
          const roundCount = getRoundCount(state.combat);

          const combatSummary = {
            winner,
            results: combatResults,
            stats: {
              rounds: roundCount,
              damageDealt: Math.max(0, initialOpponentStrength - currentOpponentStrength),
              damageTaken: Math.max(0, initialPlayerStrength - currentPlayerStrength)
            }
          };

          // Create an empty log entries array with proper typing
          const combatLog: LogEntry[] = [];

          // Using the ensure function to create a valid combat state object
          const updatedCombatState = ensureCombatState({
            isActive: true,
            combatType: null,
            winner,
            brawling: undefined,
            weapon: undefined,
            summary: combatSummary,
            participants: [] as CombatParticipant[],
            rounds: roundCount,
            combatLog
          });

          dispatch({
            type: 'UPDATE_COMBAT_STATE',
            payload: updatedCombatState,
          });

          dispatch({ type: 'SET_OPPONENT', payload: {} });
          dispatch({ type: 'SET_COMBAT_ACTIVE', payload: false });
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
    [dispatch, state, player, opponent, onUpdateNarrative, stateProtection, setIsProcessing, getRoundCount]
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
      existingCombatState?: UniversalCombatState
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

        const equippedWeaponItem = inventory.find(
          (item: InventoryItem) => item.category === 'weapon' && item.isEquipped
        );
        const equippedWeapon = equippedWeaponItem?.weapon || null;

        dispatch({ type: 'SET_COMBAT_ACTIVE', payload: true });
        dispatch({ type: 'SET_OPPONENT', payload: newOpponent });

        // Get rounds from the right property - using getRoundCount for a more robust approach
        const existingRounds = existingCombatState ? getRoundCount(existingCombatState) : 0;

        // Create an empty participants array with proper typing
        const participants: CombatParticipant[] = [];
        
        // Create an empty log entries array with proper typing
        const combatLog: LogEntry[] = [];

        // Type-safe brawling state
        const brawlingState: BrawlingState | undefined = existingCombatState?.brawling !== undefined 
          ? existingCombatState.brawling as BrawlingState 
          : {
              playerCharacterId: player.id,
              opponentCharacterId: newOpponent.id,
              round: 1 as 1 | 2, // Cast to union type
              playerModifier: 0,
              opponentModifier: 0,
              roundLog: [],
            };

        // Type-safe weapon state
        const weaponState: WeaponCombatState | undefined = existingCombatState?.weapon !== undefined 
          ? existingCombatState.weapon as WeaponCombatState 
          : {
              round: 1,
              playerWeapon: equippedWeapon,
              opponentWeapon: DefaultWeapons.coltRevolver,
              currentRange: 10,
              playerCharacterId: player.id,
              opponentCharacterId: newOpponent.id,
              roundLog: [],
            };

        const combatState = ensureCombatState({
          isActive: existingCombatState?.isActive !== undefined ? existingCombatState.isActive : true,
          combatType: existingCombatState?.combatType !== undefined ? existingCombatState.combatType : null,
          currentTurn: existingCombatState?.currentTurn || 'player',
          winner: existingCombatState?.winner || null,
          brawling: brawlingState,
          weapon: weaponState,
          summary: existingCombatState?.summary,
          rounds: existingRounds,
          participants,
          combatLog
        }) as CombatStateFromCombat;
        
        dispatch({
          type: 'UPDATE_COMBAT_STATE',
          payload: combatState,
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
    [dispatch, player, inventory, onUpdateNarrative, isUpdatingRef, getRoundCount]
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
    combatQueueLength
  };
};
