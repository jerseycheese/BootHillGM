/**
 * GameInitializer.ts
 * 
 * Handles initialization of game state and dispatching of initial content.
 * Contains functions for setting up new games and managing state dispatch.
 * Provides utilities for initializing and updating game state through Redux.
 * 
 * @module GameInitializer
 */

import { Dispatch } from 'react';
import { GameAction } from '../../types/actions';
import { Character } from '../../types/character';
import { SuggestedAction } from '../../types/campaign';
import { NarrativeJournalEntry } from '../../types/journal';
import { gameElementsStorage } from './gameElementsStorage';

/**
 * Debug console function for internal logging.
 * Only outputs when in development environment.
 * 
 * @param args - Arguments to log to console
 */
const debug = (...args: Array<unknown>): void => {
  console.log('[DEBUG GameInitializer]', ...args);
};

/**
 * Initializes basic game state for initialization scenarios.
 * Used by the initialization code paths to set up initial state.
 * Uses dynamic import to avoid circular dependencies.
 * 
 * @param character - Character object to initialize with
 * @param dispatch - Redux dispatch function for state updates
 */
const initializeGameState = (
  character: Character,
  dispatch: Dispatch<GameAction>
): void => {
  // Import GameStorage to avoid circular dependency
  import('./gameStateStorage').then(({ GameStorage }) => {
    // Initialize a new game state
    const initialState = GameStorage.initializeNewGame(character);
    
    // Set character first
    dispatch({
      type: 'character/SET_CHARACTER',
      payload: character
    } as GameAction);
    
    // Set initial state
    dispatch({ 
      type: 'SET_STATE', 
      payload: initialState 
    } as GameAction);
    
    // Set inventory
    const defaultItems = character.inventory?.items || getDefaultInventoryItems();
    dispatch({
      type: 'inventory/SET_INVENTORY',
      payload: defaultItems
    } as GameAction);
  }).catch(error => {
    console.error('Error initializing game state:', error);
  });
};

/**
 * Dispatches narrative content to state.
 * Used by initialization code paths to update narrative history.
 * Handles both narrative content and journal entries.
 * 
 * @param dispatch - Redux dispatch function for state updates
 * @param narrative - Narrative content to add to history
 * @param journalEntry - Journal entry to add
 */
const dispatchNarrativeContent = (
  dispatch: Dispatch<GameAction>,
  narrative: string,
  journalEntry: NarrativeJournalEntry
): void => {
  // Add narrative to history
  dispatch({
    type: 'ADD_NARRATIVE_HISTORY',
    payload: narrative
  });
  
  // Add journal entry
  dispatch({
    type: 'journal/ADD_ENTRY',
    payload: journalEntry
  });
};

/**
 * Dispatches suggested actions to state.
 * Used by initialization code paths to set available actions.
 * Only dispatches if actions array is valid and non-empty.
 * 
 * @param dispatch - Redux dispatch function for state updates
 * @param actions - Array of suggested actions to dispatch
 */
const dispatchSuggestedActions = (
  dispatch: Dispatch<GameAction>,
  actions: SuggestedAction[]
): void => {
  if (Array.isArray(actions) && actions.length) {
    dispatch({
      type: 'SET_SUGGESTED_ACTIONS',
      payload: actions
    });
  }
};

/**
 * Saves content to localStorage for persistence.
 * Used by initialization code paths for state backup.
 * Preserves narrative summary for recovery if it exists.
 * 
 * @param narrative - Narrative content to save
 * @param journalEntry - Journal entry to save
 * @param actions - Suggested actions to save
 */
const saveContentToLocalStorage = (
  narrative: string,
  journalEntry: NarrativeJournalEntry,
  actions: SuggestedAction[]
): void => {
  // Ensure the journal entry explicitly includes the narrativeSummary field if it exists
  const journalEntryWithSummary = journalEntry.narrativeSummary ? {
    ...journalEntry,
    narrativeSummary: journalEntry.narrativeSummary // Explicitly set to ensure it's included
  } : journalEntry;
  
  // Save to localStorage
  localStorage.setItem('narrative', JSON.stringify(narrative));
  localStorage.setItem('journal', JSON.stringify([journalEntryWithSummary]));
  localStorage.setItem('suggestedActions', JSON.stringify(actions));
  
  // Also save the summary separately for debugging and recovery if it exists
  if (journalEntry.narrativeSummary) {
    localStorage.setItem('narrative_summary', journalEntry.narrativeSummary);
  }
  
  debug('Successfully saved content to localStorage');
};

/**
 * Get default inventory items for a new character.
 * 
 * @returns Array of default inventory items
 */
const getDefaultInventoryItems = (): unknown => {
  return gameElementsStorage.getDefaultInventoryItems();
};

/**
 * Public API for game initializer functions.
 * Provides access to functions that handle game state initialization and dispatch.
 */
export const gameInitializer = {
  initializeGameState,
  dispatchNarrativeContent,
  dispatchSuggestedActions,
  saveContentToLocalStorage,
  getDefaultInventoryItems
};