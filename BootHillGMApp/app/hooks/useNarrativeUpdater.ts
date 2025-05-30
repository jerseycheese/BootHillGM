import { useCallback } from 'react';
import { useGameState } from '../context/GameStateProvider';
import { UpdateNarrativeParams } from '../types/gameSession.types';
import { ActionTypes } from '../types/actionTypes';

/**
 * Hook for handling narrative updates.
 * Provides a uniform way to update the game narrative with player inputs and responses.
 * 
 * @returns An updateNarrative function that handles narrative state updates
 */
export const useNarrativeUpdater = () => {
  // Use the correct state hook
  const { dispatch } = useGameState();

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

      // Dispatch ADD_NARRATIVE_HISTORY action with standardized action type
      // Prefix player input with "Player:" to ensure it's identified as a player action
      const combinedText = playerInput ? `Player: ${playerInput}\n${text}` : text;
      dispatch({
        type: ActionTypes.ADD_NARRATIVE_HISTORY,
        payload: combinedText
      });
    }, 
    [dispatch]
  );

  return updateNarrative;
};