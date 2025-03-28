/**
 * State types index file
 * Exports all state adapter types and utility functions
 */

// Export types
export * from './stateAdapterTypes';

// Export utils
export * from './adapterUtils';

// Export individual adapters
export { characterAdapter } from './characterAdapter';
export { inventoryAdapter } from './inventoryAdapter';
export { journalAdapter } from './journalAdapter';
export { npcsAdapter } from './npcsAdapter';
export { narrativeAdapter } from './narrativeAdapter';
export { combatAdapter } from './combatAdapter';
export { uiAdapter } from './uiAdapter';
export { migrationAdapter } from './migrationAdapter';

// Export legacy getters
export { legacyGetters } from './legacyGetters';

// Export master adapter
export { adaptStateForTests } from './masterAdapter';