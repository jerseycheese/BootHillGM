/**
 * Selector Hook Factory
 * 
 * This module provides utilities for creating memoized selector hooks
 * to access specific state data efficiently.
 */

import { useCallback, useMemo } from 'react';
import { useGame } from '../hooks/useGame';
import { GameState } from '../types/gameState';

/**
 * Type for a state selector function that extracts specific data from the state
 */
export type StateSelector<T> = (state: GameState) => T;

/**
 * Creates a custom hook that selects specific data from the game state
 * @param selector Function that extracts specific data from the state
 * @returns A hook that returns the selected data
 */
export function createSelectorHook<T>(selector: StateSelector<T>) {
  return function useSelectorHook(): T {
    // Get the game state from context
    const { state } = useGame();
    
    // Create a memoized selector function
    const memoizedSelector = useCallback(
      (currentState: GameState) => selector(currentState),
      []
    );
    
    // Use the memoized selector to extract and memoize the result
    return useMemo(() => memoizedSelector(state), [memoizedSelector, state]);
  };
}

/**
 * Creates a hook that selects a specific property from a state slice
 * @param sliceName Name of the state slice
 * @param propertySelector Function that extracts a specific property from the slice
 * @returns A hook that returns the selected property
 */
export function createSlicePropertySelector<S, P>(
  sliceName: keyof GameState,
  propertySelector: (slice: S) => P
) {
  return createSelectorHook<P>((state) => {
    const slice = state[sliceName] as unknown as S;
    return propertySelector(slice);
  });
}
