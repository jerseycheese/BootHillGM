import { characterAdapter } from './characterAdapter';
import { inventoryAdapter } from './inventoryAdapter';
import { journalAdapter } from './journalAdapter';
import { narrativeAdapter } from './narrativeAdapter';
import { combatAdapter } from './combatAdapter';
import { npcsAdapter } from './npcsAdapter';

/**
 * Legacy Getters Object
 * 
 * A collection of getters that can be used by legacy components
 * to access the new state structure without modifying component code.
 */
export const legacyGetters = {
  getPlayer: characterAdapter.getPlayer,
  getOpponent: characterAdapter.getOpponent,
  getItems: inventoryAdapter.getItems,
  getEntries: journalAdapter.getEntries,
  getNarrativeContext: narrativeAdapter.getNarrativeContext,
  isCombatActive: combatAdapter.isCombatActive,
  getNPCs: npcsAdapter.getNPCs
};