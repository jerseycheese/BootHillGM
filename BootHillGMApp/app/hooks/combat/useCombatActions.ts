import { useCallback } from 'react';
import { useCampaignState } from '../../components/CampaignStateManager';
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
  // Use the campaign state context which provides direct access to player and opponent
  const { dispatch, player, opponent } = useCampaignState();

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
          type: 'UPDATE_CHARACTER',
          payload: {
            attributes: { ...currentAttributes, strength: Number(newStrength) },
          },
        });
      } else if (characterType === 'opponent' && opponent && opponent.attributes) {
        const currentAttributes = opponent.attributes;
        dispatch({
          type: 'SET_OPPONENT',
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
      //  onUpdateNarrative('Error executing combat round: Missing character or opponent data.');
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
