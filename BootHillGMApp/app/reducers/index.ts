/**
 * Reducers Index
 * 
 * This file re-exports all reducers to provide a clean API surface.
 */

// Export narrative reducers
export { narrativeReducer, testNarrativeReducer } from './narrativeReducer';

// Export decision-specific functionality
export * from './decisionReducer';

// Export action creators
export * from '../actions/narrativeActions';

// Re-export game reducer
export { default as gameReducer } from './gameReducer';
