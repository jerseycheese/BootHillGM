import { useCallback } from 'react';
import { useGameState } from '../../context/GameStateProvider'; // Updated import
import { resolveCombatRound } from '../../utils/combat/combatResolver';
import { CombatSituation } from '../../utils/combat/hitModifiers';
import { Character } from '../../types/character';

/**
 * Custom hook for managing combat actions.
 *
 * This hook handles:
 * - Updating character strength during combat.
 * - Executing a single round of combat.
 *
 * @returns An object containing the combat action functions.
 */
export const useCombatActions = () => {
  // Use the campaign state context
  const { dispatch, state } = useGameState(); // Use the correct hook
  
  // Safely extract player from character state and opponent from root state
  const player = state?.character?.player;
  // The combat state doesn't have an opponent property - it's in the root state
  // Access opponent via the character slice
  const opponent = state?.character?.opponent || null;

  /**
   * Updates a character's strength during combat.
   * Dispatches the new strength value to the campaign state.
   *
   * @param characterType - 'player' or 'opponent'
   * @param newStrength - The updated strength value
   */
  const handleStrengthChange = useCallback(
    (characterType: 'player' | 'opponent', newStrength: number) => {
      if (characterType === 'player' && player && player.attributes) {
        const currentAttributes = player.attributes;
        dispatch({
          type: 'character/UPDATE_CHARACTER', // Use namespaced action type
          payload: {
            id: player.id, 
            attributes: { ...currentAttributes, strength: Number(newStrength) },
          },
        });
      } else if (characterType === 'opponent' && opponent && opponent.attributes) {
        const currentAttributes = opponent.attributes;
        dispatch({
          type: 'character/SET_OPPONENT', // Use namespaced action type
          payload: {
            ...opponent,
            attributes: { ...currentAttributes, strength: Number(newStrength) },
          },
        });
      }
    },
    [dispatch, player, opponent]
  );

  /**
   * Executes a single round of combat.
   */
  const executeCombatRound = useCallback(async (handleCombatEnd: (winner: 'player' | 'opponent', combatResults: string) => void) => {
    if (!player || !opponent) {
      return;
    }

    // Create copies to work with locally
    const playerCopy: Character = {
      ...player,
      attributes: { ...player.attributes }
    };
    
    const opponentCopy: Character = {
      ...opponent,
      attributes: { ...opponent.attributes }
    };

    const defaultSituation: CombatSituation = {
      isMoving: false,
      targetMoving: false,
      range: 'short',
    };

    const combatResults = await resolveCombatRound(playerCopy, opponentCopy, defaultSituation);

    // Check if strengths changed and update accordingly
    if (playerCopy.attributes.strength !== player.attributes.strength) {
      handleStrengthChange('player', playerCopy.attributes.strength);
    }

    if (opponentCopy.attributes.strength !== opponent.attributes.strength) {
      handleStrengthChange('opponent', opponentCopy.attributes.strength);
    }

    // Handle combat results
    const woundResult = combatResults.wound
      ? `, Wound: ${combatResults.wound.location} - ${combatResults.wound.severity}`
      : '';
      
    if (combatResults.hit) {
      handleCombatEnd(
        playerCopy.attributes.strength > 0 ? 'player' : 'opponent',
        `Hit: ${combatResults.hit}, Roll: ${combatResults.roll}, Target: ${combatResults.targetNumber}${woundResult}`
      );
    }
  }, [player, opponent, handleStrengthChange]);

  return { handleStrengthChange, executeCombatRound };
};
