/**
 * Utility for creating parameterized selector hooks
 * 
 * This module helps create hooks that take parameters and select state based on those parameters.
 */

import { useMemo } from 'react';
import { useGame } from './useGame';
import { GameState } from '../types/gameState';

/**
 * Creates a parameterized hook that takes an argument and selects state based on it
 * 
 * @param selector Function that takes state and a parameter and returns a selected value
 * @returns A hook function that takes a parameter and returns selected state
 * 
 * @example
 * ```tsx
 * // Create a hook for selecting a player attribute by name
 * const usePlayerAttribute = createParameterizedHook(
 *   (state, attributeName: string) => state.character?.player?.attributes?.[attributeName] ?? 0
 * );
 * 
 * // Use in a component
 * function StrengthDisplay() {
 *   const strength = usePlayerAttribute('strength');
 *   return <div>Strength: {strength}</div>;
 * }
 * ```
 */
export function createParameterizedHook<T, P>(
  selector: (state: GameState, param: P) => T
) {
  // Return a hook function that takes the parameter
  return function useParameterizedHook(param: P): T {
    const { state } = useGame();
    
    // Use memoization to prevent unnecessary recalculations
    return useMemo(
      () => selector(state, param),
      [state, param] // Re-run when either state or parameter changes
    );
  };
}
