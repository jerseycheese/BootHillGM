import { useCallback } from 'react';
import { Character } from '../types/character';
import { useCampaignState } from '../components/CampaignStateManager';
import { DefaultWeapons } from '../data/defaultWeapons';
import { addCombatJournalEntry } from '../utils/JournalManager';
import { CombatState, ensureCombatState } from '../types/combat/types';
import { cleanCharacterName } from '../utils/combatUtils';
import { useCombatState } from './combat/useCombatState';
import { useCombatActions } from './combat/useCombatActions';

/**
 * Custom hook for managing combat encounters.
 * 
 * This hook orchestrates combat state, actions, and synchronization with the global state.
 * 
 * @param onUpdateNarrative - Callback function to update the narrative text.
 * @returns An object containing combat-related state and functions.
 */
export const useCombatManager = ({ onUpdateNarrative }: { onUpdateNarrative: (text: string) => void }) => {
  const { dispatch, state } = useCampaignState();
  const {
    isProcessing,
    setIsProcessing,
    isUpdatingRef,
    combatQueueLength,
    stateProtection
  } = useCombatState();

  const { handleStrengthChange, executeCombatRound } = useCombatActions();

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
          const playerName = state.character?.name || 'Player';
          const opponentName = state.opponent?.name || 'Unknown Opponent';

          const cleanPlayerName = cleanCharacterName(playerName);
          const cleanOpponentName = cleanCharacterName(opponentName);
          const endMessage =
            winner === 'player'
              ? `${cleanPlayerName} emerges victorious, defeating ${cleanOpponentName}.`
              : `${cleanOpponentName} emerges victorious, defeating ${cleanPlayerName}.`;

          onUpdateNarrative(combatResults);
          onUpdateNarrative(endMessage);

          const currentJournal = state.journal || [];
          dispatch({
            type: 'UPDATE_JOURNAL',
            payload: addCombatJournalEntry(
              currentJournal,
              playerName,
              opponentName,
              winner === 'player' ? 'victory' : 'defeat',
              endMessage
            ),
          });

          const initialPlayerStrength = state.character?.attributes?.strength || 0;
          const currentPlayerStrength = state.character?.attributes?.strength || 0;
          const initialOpponentStrength = state.opponent?.attributes?.strength || 0;
          const currentOpponentStrength = state.opponent?.attributes?.strength || 0;

          const combatSummary = {
            winner,
            results: combatResults,
            stats: {
              rounds: state.combatState?.rounds || 0,
              damageDealt: Math.max(0, initialOpponentStrength - currentOpponentStrength),
              damageTaken: Math.max(0, initialPlayerStrength - currentPlayerStrength)
            }
          };

          dispatch({
            type: 'UPDATE_COMBAT_STATE',
            payload: ensureCombatState({
              isActive: true,
              combatType: null,
              winner: winner,
              brawling: undefined,
              weapon: undefined,
              summary: combatSummary
            }),
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
    [dispatch, state, onUpdateNarrative, stateProtection, setIsProcessing]
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
      existingCombatState?: Partial<CombatState>
    ) => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;

      try {
        if (!state.character) {
          onUpdateNarrative('No player character available to initiate combat.');
          return;
        }

        if (!newOpponent) {
          onUpdateNarrative('No opponent character available to initiate combat.');
          return;
        }

        const equippedWeaponItem = state.inventory?.find(
          item => item.category === 'weapon' && item.isEquipped
        );
        const equippedWeapon = equippedWeaponItem?.weapon || null;

        dispatch({ type: 'SET_COMBAT_ACTIVE', payload: true });
        dispatch({ type: 'SET_OPPONENT', payload: newOpponent });

        const combatState = ensureCombatState({
          isActive: existingCombatState?.isActive !== undefined ? existingCombatState.isActive : true,
          combatType: existingCombatState?.combatType !== undefined ? existingCombatState.combatType : null,
          currentTurn: existingCombatState?.currentTurn !== undefined ? existingCombatState.currentTurn : 'player',
          winner: existingCombatState?.winner !== undefined ? existingCombatState.winner : null,
          brawling: existingCombatState?.brawling !== undefined ? existingCombatState.brawling : {
            playerCharacterId: state.character.id,
            opponentCharacterId: newOpponent.id,
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            roundLog: [],
          },
          weapon: existingCombatState?.weapon !== undefined ? existingCombatState.weapon : {
            round: 1,
            playerWeapon: equippedWeapon,
            opponentWeapon: DefaultWeapons.coltRevolver,
            currentRange: 10,
            playerCharacterId: state.character.id,
            opponentCharacterId: newOpponent.id,
            roundLog: [],
          },
          summary: existingCombatState?.summary
        });
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
    [dispatch, state.character, state.inventory, onUpdateNarrative, isUpdatingRef]
  );

  /**
   * Retrieves the current opponent in combat.
   *
   * @returns The current opponent character or null if not in combat.
   */
  const getCurrentOpponent = useCallback(() => state.opponent, [state.opponent]);

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
