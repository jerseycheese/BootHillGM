/**
 * State Hooks Index
 * 
 * This module re-exports all state selector hooks for easier importing.
 */

// Export all selector hooks from their respective files
export * from './selectors/useCharacterSelectors';
export * from './useCombatState';
export * from './useInventoryState';
export * from './useJournalState';
export * from './useNarrativeState';
export * from './useUIState';

// Re-export the hook factories for custom selectors
export { createStateHook, createPropertyHook } from './createStateHook';
export { createParameterizedHook } from './createParameterizedHook';

/**
 * This file provides a central entry point for all state selector hooks in the application.
 * 
 * Examples:
 * 
 * ```typescript
 * // Using selector hooks in a component
 * function PlayerStatusCard() {
 *   // Only re-renders when these specific values change
 *   const health = usePlayerHealth();
 *   const inventory = useInventoryItems();
 *   const isInCombat = useCombatActive();
 *   
 *   return (
 *     <div className="status-card">
 *       <h3>Player Status</h3>
 *       <p>Health: {health}</p>
 *       <p>Items: {inventory.length}</p>
 *       {isInCombat && <p className="warning">⚔️ In Combat</p>}
 *     </div>
 *   );
 * }
 * ```
 * 
 * The selector pattern provides several key benefits:
 * 
 * 1. **Memoization**: Components only re-render when the specific data they use changes
 * 2. **Encapsulation**: Components don't need to know about the state structure
 * 3. **Type safety**: Selectors provide proper TypeScript types
 * 4. **Testability**: Selectors are easy to test in isolation
 * 5. **Maintainability**: Changes to the state structure only require updating selectors
 */
