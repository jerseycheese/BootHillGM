/**
 * Core action types for state management
 * 
 * This file combines all domain-specific actions into a unified GameAction type
 * that is used by all reducers and state management utilities.
 */

import { CharacterAction } from './actions/characterActions';
import { CombatAction } from './actions/combatActions';
import { InventoryAction } from './actions/inventoryActions';
import { JournalAction } from './actions/journalActions';
import { NarrativeAction } from './actions/narrativeActions';
import { UIAction } from './actions/uiActions';
import { StoryProgressionAction } from './narrative/actions.types';
import { GameState } from './gameState';

import { SuggestedAction } from './campaign';
/**
 * Global actions that don't belong to a specific slice
 */
export interface SetPlayerAction {
  type: 'SET_PLAYER';
  payload: string;
}

export interface AddNPCAction {
  type: 'ADD_NPC';
  payload: string;
}

export interface SetLocationAction {
  type: 'SET_LOCATION';
  payload: unknown; // LocationType
}

export interface AddQuestAction {
  type: 'ADD_QUEST';
  payload: string;
}

export interface SetGameProgressAction {
  type: 'SET_GAME_PROGRESS';
  payload: number;
}

export interface SetSavedTimestampAction {
  type: 'SET_SAVED_TIMESTAMP';
  payload: number;
}

export interface SetStateAction {
  type: 'SET_STATE';
  payload: Partial<GameState>;
}


export interface SetSuggestedActionsAction {
  type: 'SET_SUGGESTED_ACTIONS';
  payload: SuggestedAction[];
}


export interface ClearErrorAction {
  type: 'CLEAR_ERROR';
}

export interface NoOpAction {
  type: 'NO_OP';
  payload?: undefined;
}

/**
 * Union type of all global actions
 */
export type GlobalAction =
  | SetPlayerAction
  | AddNPCAction
  | SetLocationAction
  | AddQuestAction
  | SetGameProgressAction
  | SetSavedTimestampAction
  | SetStateAction
  | NoOpAction
  | SetSuggestedActionsAction // Added new action type
  | ClearErrorAction; // Added CLEAR_ERROR

/**
 * Combined action type used throughout the application
 * 
 * This union type combines all domain-specific actions and global actions.
 */
export type GameAction =
  | GlobalAction
  | CharacterAction
  | CombatAction
  | InventoryAction
  | JournalAction
  | NarrativeAction
  | UIAction
  | StoryProgressionAction; // Add Story Progression actions
