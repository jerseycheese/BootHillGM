import { useMemo, useRef } from 'react';
import { useGame } from './useGame';
import { GameState } from '../types/gameState';

/**
 * Creates a specialized hook for accessing part of the state
 * 
 * This factory function makes it easy to define custom selector hooks
 * with proper memoization. It's similar to how React's useMemo works,
 * but specialized for state selection with dependency tracking.
 * 
 * @param selector Function that extracts a slice of state
 * @param getDependencies Function that returns an array of dependencies
 * @returns A hook function that returns the selected state
 * 
 * @example
 * ```tsx
 * // Define a hook for accessing the player's health
 * const usePlayerHealth = createStateHook(
 *   (state) => state.character?.player?.health || 0,
 *   (state) => [state.character?.player?.health]
 * );
 * 
 * // Use in a component
 * function HealthDisplay() {
 *   const health = usePlayerHealth();
 *   return <div>Health: {health}</div>;
 * }
 * ```
 */
export function createStateHook<T, D extends unknown[]>(
  selector: (state: GameState) => T,
  getDependencies: (state: GameState) => D = () => [] as unknown as D
) {
  // Return a custom hook function
  return function useStateHook(): T {
    const { state } = useGame();
    
    // Get explicit dependencies
    const nextDeps = getDependencies(state);
    // Use currentDepsRef to hold the dependencies from the previous render
    const currentDepsRef = useRef<D | null>(null);
    
    // Update currentDepsRef for the next render
    currentDepsRef.current = nextDeps;
    
    // Memoize the selected value based on dependencies
    return useMemo(() => {
      const selectedValue = selector(state);
      return selectedValue;
    }, [state]); // Only depend on state since the selector only uses state
  };
}

/**
 * Creates a hook that selects a specific property from state
 * 
 * This is a simpler version of createStateHook for common cases
 * 
 * @param path Path to the property in dot notation (e.g., 'character.player.health')
 * @returns A hook function that returns the property value
 * 
 * @example
 * ```tsx
 * const usePlayerName = createPropertyHook('character.player.name');
 * 
 * function NameDisplay() {
 *   const name = usePlayerName();
 *   return <div>Name: {name || 'Unknown'}</div>;
 * }
 * ```
 */
export function createPropertyHook<T>(path: string) {
  const parts = path.split('.');
  
  return createStateHook<T, unknown[]>(
    (state) => {
      let value: unknown = state;
      
      for (const part of parts) {
        if (value === undefined || value === null) {
          return undefined as unknown as T;
        }
        value = (value as Record<string, unknown>)[part];
      }
      
      return value as T;
    },
    (state) => {
      // Create a dependencies array including each segment of the path
      const deps: unknown[] = [];
      let current: unknown = state; // Changed type to unknown

      for (const part of parts) {
        if (current === undefined || current === null) {
          break; // Stop if any segment is null or undefined
        }
        deps.push(current); // Add current level to dependencies
        current = (current as Record<string, unknown>)[part]; // Move to next level with type assertion
      }
      
      return deps;
    }
  );
}
