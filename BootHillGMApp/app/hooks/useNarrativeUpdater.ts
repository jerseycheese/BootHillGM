import { useCallback } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import { addNarrativeHistory } from '../actions/narrativeActions';
import { UpdateNarrativeParams } from '../types/gameSession.types';

/**
 * Hook for handling narrative updates.
 * Provides a uniform way to update the game narrative with player inputs and responses.
 * 
 * @returns An updateNarrative function that handles narrative state updates
 */
export const useNarrativeUpdater = () => {
  const { dispatch } = useCampaignState();

  /**
   * Updates the game narrative using the narrativeReducer
   * Can accept either a simple text string or a detailed parameter object
   * 
   * @param textOrParams - Either a narrative text string or an object with narrative parameters
   */
  const updateNarrative = useCallback(
    (textOrParams: string | UpdateNarrativeParams) => {
      let text: string;
      let playerInput: string | undefined;

      if (typeof textOrParams === 'string') {
        text = textOrParams;
      } else {
        text = textOrParams.text;
        playerInput = textOrParams.playerInput;
      }

      // Dispatch ADD_NARRATIVE_HISTORY action
      // Prefix player input with "Player:" to ensure it's identified as a player action
      const combinedText = playerInput ? `Player: ${playerInput}\n${text}` : text;
      dispatch(addNarrativeHistory(combinedText));
    }, 
    [dispatch]
  );

  return updateNarrative;
};