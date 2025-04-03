/**
 * Export all contexts from a single file for better organization
 */

export { GameStateContext, GameStateProvider, useGameState } from './GameStateProvider'; // Removed 'default as'
export { default as NarrativeContext, useNarrative } from './NarrativeContext';
