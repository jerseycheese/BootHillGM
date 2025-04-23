/**
 * Custom Jest matchers for state testing
 */
import { GameState } from '../../../types/gameState';
import { InventoryState } from '../../../types/state/inventoryState';
import { JournalEntry as AppJournalEntry } from '../../../types/journal';

// Browser-safe versions of the matchers for type compatibility
export const stateMatchers = {
  toHaveItems: (state: Partial<GameState>, count: number) => {
    const inventory = state.inventory as InventoryState;
    const itemCount = inventory?.items?.length || 0;
    return itemCount === count;
  },
  
  toHaveJournalEntries: (state: Partial<GameState>, count: number) => {
    const legacyState = state as unknown as { entries?: AppJournalEntry[] };
    const entryCount = legacyState.entries?.length || state.journal?.entries?.length || 0;
    return entryCount === count;
  },
  
  toHaveCombatActive: (state: Partial<GameState>) => {
    const isCombatActive = state.combat?.isActive || (state as unknown as { isCombatActive?: boolean }).isCombatActive;
    return Boolean(isCombatActive);
  }
};