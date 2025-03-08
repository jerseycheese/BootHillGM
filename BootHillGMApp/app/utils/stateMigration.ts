import { GameState, initialGameState } from '../types/gameState';
import { initialNarrativeState } from '../types/narrative.types';

export const migrateGameState = (oldState: GameState | undefined): GameState => {
  if (!oldState) {
    return initialGameState;
  }

  let migratedState = { ...oldState };

  if (!migratedState.narrative) {
    migratedState = {
      ...migratedState,
      narrative: initialNarrativeState,
    };
  }

  // Add more migration logic here if needed

  return migratedState as GameState;
};