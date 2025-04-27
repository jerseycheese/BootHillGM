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
import { getStartingInventory } from '../startingInventory';
import { ActionTypes } from '../../types/actionTypes';

/**
 * Get default inventory items for a new character.
 * Uses the official getStartingInventory function to generate proper starting items.
 * 
 * @returns Array of default inventory items
 */
const getDefaultInventoryItems = () => {
  // Get starting inventory directly from the source
  return getStartingInventory();
};

/**
 * Initializes basic game state for initialization scenarios.
 * Used by the initialization code paths to set up initial state.
 * Ensures inventory items are properly initialized with the character
 * before the first render to avoid the empty inventory issue.
 * 
 * @param character - Character object to initialize with
 * @param dispatch - Redux dispatch function for state updates
 */
const initializeGameState = (
  character: Character,
  dispatch: Dispatch<GameAction>
): void => {
  // Generate starting inventory immediately
  const startingItems = getStartingInventory();
  
  // Make sure character has the starting inventory
  if (!character.inventory || !Array.isArray(character.inventory.items) || character.inventory.items.length === 0) {
    character.inventory = {
      ...(character.inventory || {}),
      items: startingItems
    };
  }
  
  // Import GameStorage to avoid circular dependency
  import('./gameStateStorage').then(({ GameStorage }) => {
    // Initialize a new game state with character already containing inventory
    const initialState = GameStorage.initializeNewGame(character);
    
    // Set character first (now with inventory)
    dispatch({
      type: ActionTypes.SET_CHARACTER,
      payload: character
    } as GameAction);
    
    // Set initial state
    dispatch({ 
      type: ActionTypes.SET_STATE,
      payload: initialState
    });

    // Also explicitly set inventory (as a safety measure)
    dispatch({
      type: ActionTypes.SET_INVENTORY,
      payload: startingItems
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
    type: ActionTypes.ADD_NARRATIVE_HISTORY, // Use ActionTypes constant
    payload: narrative
  });
  
  // Add journal entry
  dispatch({
    type: ActionTypes.ADD_ENTRY,
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
      type: ActionTypes.SET_SUGGESTED_ACTIONS,
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