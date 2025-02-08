import { useCallback, useRef, useState } from 'react';
import { Character } from '../types/character';
import { useCampaignState } from '../components/CampaignStateManager';
import { DefaultWeapons } from '../data/defaultWeapons';
import { addCombatJournalEntry } from '../utils/JournalManager';
import { createStateProtection } from '../utils/stateProtection';
import { CombatState, CombatSummary, ensureCombatState } from '../types/combat';
import { cleanCharacterName, resolveCombat } from '../utils/combatUtils';

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
  const handleCombatEnd = useCallback(
    async (winner: 'player' | 'opponent', combatResults: string) => {
      setIsProcessing(true);
      try {
        await stateProtection.current.withProtection('combat-end', async () => {
          // Get current names directly from state
          const playerName = state.character?.name || 'Player';
          const opponentName = state.opponent?.name || 'Unknown Opponent';

          // Clean the names first
          const cleanPlayerName = cleanCharacterName(playerName);
          const cleanOpponentName = cleanCharacterName(opponentName);

          // Construct the victory message
          const endMessage =
            winner === 'player'
              ? `${cleanPlayerName} emerges victorious, defeating ${cleanOpponentName}.`
              : `${cleanOpponentName} emerges victorious, defeating ${cleanPlayerName}.`;

          // Update narrative with detailed combat results
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
              endMessage // Use the same message we created for the narrative
            ),
          });

          // Calculate final combat statistics by comparing initial and current strength values
          const initialPlayerStrength = state.character?.attributes?.strength || 0; // Initial strength from character
          const currentPlayerStrength = state.character?.attributes?.strength || 0; // Current strength from character
          const initialOpponentStrength = state.opponent?.attributes?.strength || 0; // Initial strength from opponent
          const currentOpponentStrength = state.opponent?.attributes?.strength || 0; // Current strength from opponent

          // Create combat summary with calculated statistics
          const combatSummary: CombatSummary = {
            winner,
            results: combatResults,
            stats: {
              rounds: state.combatState?.rounds || 0,
              damageDealt: Math.max(0, initialOpponentStrength - currentOpponentStrength), // Damage dealt to opponent
              damageTaken: Math.max(0, initialPlayerStrength - currentPlayerStrength)    // Damage taken by player
            }
          };

          // Update combat state with summary first
          dispatch({
            type: 'UPDATE_COMBAT_STATE',
            payload: ensureCombatState({
              isActive: true, // Keep active until we've updated the summary
              combatType: null,
              winner: winner,
              brawling: undefined,
              weapon: undefined,
              selection: undefined,
              summary: combatSummary
            }),
          });

          // Then clear opponent state
          dispatch({ type: 'SET_OPPONENT', payload: {} });

          // Finally set combat inactive
          dispatch({ type: 'SET_COMBAT_ACTIVE', payload: false });
        });
      } catch {
        onUpdateNarrative(
          'There was an error processing the combat end. Please try again.'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [dispatch, state, onUpdateNarrative]
  );

  /**
   * Updates a character's strength during combat.
   * Dispatches the new strength value to the campaign state.
   *
   * @param characterType - 'player' or 'opponent'
   * @param newStrength - The updated strength value
   */
  const handleStrengthChange = useCallback(
    (characterType: 'player' | 'opponent', newStrength: number) => {
      if (isUpdatingRef.current) return;

      if (characterType === 'player' && state.character) {
        const currentAttributes = state.character.attributes;
        dispatch({
          type: 'UPDATE_CHARACTER',
          payload: {
            attributes: { ...currentAttributes, strength: Number(newStrength) },
          },
        });
      } else if (characterType === 'opponent' && state.opponent) {
        const currentAttributes = state.opponent.attributes;
        dispatch({
          type: 'SET_OPPONENT',
          payload: {
            ...state.opponent,
            attributes: { ...currentAttributes, strength: Number(newStrength) },
          },
        });
      }
    },
    [dispatch, state.character, state.opponent]
  );

  /**
   * Initiates or restores a combat encounter.
   * Handles both new combat initialization and existing combat state restoration.
   *
   * @param newOpponent - The opponent character to fight against
   * @param existingCombatState - Optional existing combat state to restore
   */
  const initiateCombat = useCallback(
    async (
      newOpponent: Character,
      existingCombatState?: Partial<CombatState>
    ) => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;

      try {
        // Ensure player character is available
        if (!state.character) {
          onUpdateNarrative('No player character available to initiate combat.');
          return;
        }

        // Ensure opponent character is available
        if (!newOpponent) {
          onUpdateNarrative('No opponent character available to initiate combat.');
          return;
        }

        // Find equipped weapon
        const equippedWeaponItem = state.inventory?.find(
          item => item.category === 'weapon' && item.isEquipped
        );
        const equippedWeapon = equippedWeaponItem?.weapon || null;

        // Set combat active first
        dispatch({ type: 'SET_COMBAT_ACTIVE', payload: true });

        // Set opponent next
        dispatch({ type: 'SET_OPPONENT', payload: newOpponent });

        // Initialize or restore combat state
        const combatState = ensureCombatState({
          ...existingCombatState,
          isActive: true,
          combatType: null, // Will be selected later
          currentTurn: 'player',
          winner: null,
          brawling: { // Initialize brawling state with character IDs
            playerCharacterId: state.character.id,
            opponentCharacterId: newOpponent.id,
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            roundLog: [],
          },
          weapon: {
            round: 1,
            playerWeapon: equippedWeapon,
            opponentWeapon: DefaultWeapons.coltRevolver,
            currentRange: 10,
            playerCharacterId: state.character.id, // Use character references
            opponentCharacterId: newOpponent.id,   // Use character references
            roundLog: [],
          }
        });
        // Update combat state with proper type conversion
        dispatch({
          type: 'UPDATE_COMBAT_STATE',
          payload: combatState,
        });
      } catch {
        onUpdateNarrative(
          'There was an error processing the combat initiation. Please try again.'
        );
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [dispatch, state.character, state.inventory, onUpdateNarrative]
  );

  /**
   * Executes a single round of combat.
   */
  const executeCombatRound = useCallback(async () => {
    if (!state.character || !state.opponent) {
      onUpdateNarrative('Error executing combat round: Missing character or opponent data.');
      return;
    }

    // Create deep copies of characters to track strength changes
    const playerCopy = {
      ...state.character,
      attributes: { ...state.character.attributes }
    };
    const opponentCopy = {
      ...state.opponent,
      attributes: { ...state.opponent.attributes }
    };

    // Execute combat
    const combatResults = await resolveCombat(playerCopy, opponentCopy);
    
    // Only update strengths if they've changed
    if (playerCopy.attributes.strength !== state.character.attributes.strength) {
      handleStrengthChange('player', playerCopy.attributes.strength);
    }
    
    if (opponentCopy.attributes.strength !== state.opponent.attributes.strength) {
      handleStrengthChange('opponent', opponentCopy.attributes.strength);
    }

    // Handle combat end
    handleCombatEnd(combatResults.winner, combatResults.results);
  }, [state.character, state.opponent, handleStrengthChange, handleCombatEnd, onUpdateNarrative]);


  /**
   * Retrieves the current opponent in combat.
   *
   * @returns The current opponent character or null if not in combat
   */
  const getCurrentOpponent = useCallback(() => state.opponent, [state.opponent]);

  return {
    ...state,
    handleCombatEnd,
    handleStrengthChange,
    initiateCombat,
    getCurrentOpponent,
    executeCombatRound,
    isProcessing,
    combatQueueLength: stateProtection.current.getQueueLength('combat-end'),
  };
};
