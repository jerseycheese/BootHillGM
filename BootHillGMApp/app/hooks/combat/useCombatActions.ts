import { useCallback } from 'react';
import { useCampaignState } from '../../components/CampaignStateManager';
import { resolveCombatRound } from '../../utils/combat/combatResolver';
import { CombatSituation } from '../../utils/combat/hitModifiers';

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
  const { dispatch, state } = useCampaignState();

  /**
   * Updates a character's strength during combat.
   * Dispatches the new strength value to the campaign state.
   *
   * @param characterType - 'player' or 'opponent'
   * @param newStrength - The updated strength value
   */
  const handleStrengthChange = useCallback(
    (characterType: 'player' | 'opponent', newStrength: number) => {
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
   * Executes a single round of combat.
   */
  const executeCombatRound = useCallback(async (handleCombatEnd: (winner: 'player' | 'opponent', combatResults: string) => void) => {
    if (!state.character || !state.opponent) {
      //  onUpdateNarrative('Error executing combat round: Missing character or opponent data.');
      return;
    }

    const playerCopy = {
      ...state.character,
      attributes: { ...state.character.attributes }
    };
    const opponentCopy = {
      ...state.opponent,
      attributes: { ...state.opponent.attributes }
    };

    const defaultSituation: CombatSituation = {
      isMoving: false,
      targetMoving: false,
      range: 'short',
    };

    const combatResults = await resolveCombatRound(playerCopy, opponentCopy, defaultSituation);

    if (playerCopy.attributes.strength !== state.character.attributes.strength) {
      handleStrengthChange('player', playerCopy.attributes.strength);
    }

    if (opponentCopy.attributes.strength !== state.opponent.attributes.strength) {
      handleStrengthChange('opponent', opponentCopy.attributes.strength);
    }

    const woundResult = combatResults.wound
      ? `, Wound: ${combatResults.wound.location} - ${combatResults.wound.severity}`
      : '';
    if (combatResults.hit) {
      handleCombatEnd(playerCopy.attributes.strength > 0 ? 'player' : 'opponent',
        `Hit: ${combatResults.hit}, Roll: ${combatResults.roll}, Target: ${combatResults.targetNumber}${woundResult}`);
    }
  }, [state.character, state.opponent, handleStrengthChange]);

  return { handleStrengthChange, executeCombatRound };
};
