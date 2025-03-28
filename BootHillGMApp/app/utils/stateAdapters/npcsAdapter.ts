import { GameState } from '../../types/gameState';
import { ensureNPCsArray } from '../gameReducerHelpers';

/**
 * NPCs Adapter
 * 
 * Ensures NPCs array is properly formatted for tests
 */
export const npcsAdapter = {
  // Getter to adapt new state to old state shape
  getNPCs: (state: GameState): string[] => {
    if (!state || !state.npcs) return [];
    
    // Convert to string array - the state might have complex objects 
    // that were created during JSON serialization/deserialization
    return ensureNPCsArray(state.npcs);
  },
  
  // Adapter method to handle the state structure difference in tests
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Convert NPCs to string array for test compatibility
    const npcsArray = npcsAdapter.getNPCs(state);
    
    return {
      ...state,
      npcs: npcsArray
    };
  }
};