import { useEffect, useRef } from 'react';
import { GameState } from '../types/gameState';

/**
 * Hook for automatically saving game state when important changes occur.
 * Monitors narrative and combat changes to trigger auto-saves with debouncing.
 * 
 * @param {GameState} state - Current game state
 * @param {Function} saveGame - Function to save the game state
 * @param {React.MutableRefObject<boolean>} isInitializedRef - Initialization status reference
 * @returns {Object} Object containing the narrative reference for tracking changes
 */
export const useAutoSave = (
  state: GameState, 
  saveGame: (state: GameState) => void,
  isInitializedRef: React.MutableRefObject<boolean>
) => {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const previousNarrativeRef = useRef<string>('');
  
  // Auto-save effect for narrative changes
  useEffect(() => {
    const currentNarrative = state.narrative?.narrativeHistory?.join('') || '';
    if (!isInitializedRef.current || !state.narrative || currentNarrative === previousNarrativeRef.current) {
      return;
    }

    previousNarrativeRef.current = currentNarrative;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveGame(state as GameState);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, state.narrative, saveGame, isInitializedRef]);

  // Combat state persistence effect
  useEffect(() => {
    if (!isInitializedRef.current || !state.combat?.isActive) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveGame(state as GameState);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    state,
    state.combat,
    saveGame,
    isInitializedRef
  ]);

  return {
    previousNarrativeRef
  };
};
