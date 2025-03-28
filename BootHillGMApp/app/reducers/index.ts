/**
 * Reducers index file
 * Exports all reducers for easy importing throughout the app
 */

// Export root reducer
export { rootReducer } from './rootReducer';

// Export gameEngineReducer as gameReducer for backward compatibility
export { gameEngineReducer as gameReducer } from './rootReducer';

// Export action adapter utilities
export { 
  isGameEngineAction,
  adaptEngineAction,
  createCompatibleDispatch,
  getDomainFromActionType
} from './gameActionsAdapter';

// Export individual slice reducers
export { characterReducer } from './character/characterReducer';
export { combatReducer } from './combat/combatReducer'; 
export { inventoryReducer } from './inventory/inventoryReducer';
export { journalReducer } from './journal/journalReducer';
export { narrativeReducer } from './narrative/narrativeReducer';
export { uiReducer } from './ui/uiReducer';

// Export type guard utilities
export * from './utils/typeGuards';

// Export other existing exports to maintain backwards compatibility
export { narrativeReducer as testNarrativeReducer } from './narrativeReducer';
export * from './decisionReducer';
export * from '../actions/narrativeActions';
