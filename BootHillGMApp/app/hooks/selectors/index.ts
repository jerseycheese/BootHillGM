/**
 * State selector hooks index file
 * 
 * This file exports all domain-specific selector hooks from a single entry point.
 */

// Export all selector hooks
export * from './useCharacterSelectors';
export * from './useCombatSelectors';
export * from './useInventorySelectors';
export * from './useJournalSelectors';
export * from './useNarrativeSelectors';
export * from './useUISelectors';

// Also re-export the hook factory for custom selector creation
export { createStateHook, createPropertyHook } from '../createStateHook';
