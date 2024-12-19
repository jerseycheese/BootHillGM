import { GameState } from '../../types/gameState';

/**
 * Compares two game states while ignoring timestamp-related fields
 * @param state1 First state to compare
 * @param state2 Second state to compare
 * @param ignoreFields Optional array of additional fields to ignore in comparison
 */
export const compareStatesWithoutTimestamp = (
  state1: Partial<GameState>,
  state2: Partial<GameState>,
  ignoreFields: string[] = []
) => {
  const fieldsToIgnore = ['savedTimestamp', ...ignoreFields];
  
  const cleanState = (state: Partial<GameState>) => {
    const cleaned = { ...state };
    fieldsToIgnore.forEach(field => {
      delete cleaned[field as keyof GameState];
    });
    return cleaned;
  };

  const cleanedState1 = cleanState(state1);
  const cleanedState2 = cleanState(state2);

  expect(cleanedState1).toEqual(cleanedState2);
};
