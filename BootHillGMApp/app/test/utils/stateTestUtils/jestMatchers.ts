/**
 * Custom Jest matchers for state testing
 */
import { GameState } from '../../../types/gameState';
import { InventoryState } from '../../../types/state/inventoryState';
import { JournalEntry as AppJournalEntry } from '../../../types/journal';

/**
 * Add to Jest's expect matchers for more readable tests
 */
expect.extend({
  toHaveItems(state: Partial<GameState>, count: number) {
    const inventory = state.inventory as InventoryState;
    const itemCount = inventory?.items?.length || 0;
    
    return {
      message: () => `expected state to have ${count} items, but it has ${itemCount}`,
      pass: itemCount === count
    };
  },
  
  toHaveJournalEntries(state: Partial<GameState>, count: number) {
    const legacyState = state as unknown as { entries?: AppJournalEntry[] };
    const entryCount = legacyState.entries?.length || state.journal?.entries?.length || 0;
    
    return {
      message: () => `expected state to have ${count} journal entries, but it has ${entryCount}`,
      pass: entryCount === count
    };
  },
  
  toHaveCombatActive(state: Partial<GameState>) {
    const isCombatActive = state.combat?.isActive || (state as unknown as { isCombatActive?: boolean }).isCombatActive;
    
    return {
      message: () => `expected state to have combat active, but it was ${isCombatActive ? 'active' : 'inactive'}`,
      pass: Boolean(isCombatActive)
    };
  }
});