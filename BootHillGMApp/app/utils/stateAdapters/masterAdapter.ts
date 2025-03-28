import { GameState } from '../../types/gameState';
import { characterAdapter } from './characterAdapter';
import { inventoryAdapter } from './inventoryAdapter';
import { journalAdapter } from './journalAdapter';
import { narrativeAdapter } from './narrativeAdapter';
import { combatAdapter } from './combatAdapter';
import { uiAdapter } from './uiAdapter';
import { npcsAdapter } from './npcsAdapter';

/**
 * Master Adapter
 *
 * Combines all adapters to provide a single function that adapts
 * the entire state for backward compatibility with tests and legacy components.
 * This is similar to how React uses Higher-Order Components to transform props or state.
 */
export const adaptStateForTests = (state: GameState): GameState => {
  if (!state) return state;
  
  // Apply all adapters in sequence
  let adaptedState = state;
  adaptedState = characterAdapter.adaptForTests(adaptedState);
  adaptedState = inventoryAdapter.adaptForTests(adaptedState); 
  adaptedState = journalAdapter.adaptForTests(adaptedState);
  adaptedState = narrativeAdapter.adaptForTests(adaptedState);
  adaptedState = combatAdapter.adaptForTests(adaptedState);
  adaptedState = uiAdapter.adaptForTests(adaptedState);
  adaptedState = npcsAdapter.adaptForTests(adaptedState);

  return adaptedState;
};