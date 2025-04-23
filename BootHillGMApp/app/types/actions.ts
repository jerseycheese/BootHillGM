/**
 * Action Types
 * 
 * This file defines the type interfaces for all actions
 * used throughout the application.
 */

import { CombatType } from './combat';
import { ActionTypes } from './actionTypes';

/**
 * Base action interface
 */
export interface Action<T extends string, P = unknown> {
  type: T;
  payload?: P;
  meta?: Record<string, unknown>;
}

/**
 * Generic game action type
 * Encompasses all possible actions in the application
 */
export type GameAction = 
  | GlobalAction
  | CharacterAction
  | InventoryAction
  | JournalAction
  | NarrativeAction
  | CombatAction
  | GameStateAction
  | UIAction
  | LoreAction
  | ErrorAction
  | DecisionAction
  | StoryAction;

/**
 * Global actions
 */
export type GlobalAction = 
  | Action<typeof ActionTypes.SET_STATE, unknown>
  | Action<typeof ActionTypes.RESET_STATE>
  | Action<typeof ActionTypes.SAVE_GAME>
  | Action<typeof ActionTypes.LOAD_GAME>;

/**
 * Character actions
 */
export type CharacterAction = 
  | Action<typeof ActionTypes.SET_CHARACTER, unknown>
  | Action<typeof ActionTypes.UPDATE_CHARACTER, unknown>
  | Action<typeof ActionTypes.SET_OPPONENT, unknown>
  | Action<typeof ActionTypes.UPDATE_OPPONENT, unknown>;

/**
 * Inventory actions
 */
export type InventoryAction = 
  | Action<typeof ActionTypes.ADD_ITEM, unknown>
  | Action<typeof ActionTypes.REMOVE_ITEM, string>
  | Action<typeof ActionTypes.EQUIP_WEAPON, string>
  | Action<typeof ActionTypes.UNEQUIP_WEAPON, string>
  | Action<typeof ActionTypes.USE_ITEM, string>
  | Action<typeof ActionTypes.UPDATE_ITEM_QUANTITY, { id: string, quantity: number } | { itemId: string, quantity: number }>
  | Action<typeof ActionTypes.SET_INVENTORY, unknown[]>
  | Action<typeof ActionTypes.CLEAN_INVENTORY>;

/**
 * Journal actions
 */
export type JournalAction = 
  | Action<typeof ActionTypes.ADD_ENTRY, unknown>
  | Action<typeof ActionTypes.REMOVE_ENTRY, string>
  | Action<typeof ActionTypes.UPDATE_JOURNAL, unknown>
  | Action<typeof ActionTypes.SET_ENTRIES, unknown[]>
  | Action<typeof ActionTypes.CLEAR_ENTRIES>
  | Action<typeof ActionTypes.UPDATE_JOURNAL_GENERAL, unknown>;

/**
 * Narrative actions
 */
export type NarrativeAction = 
  | Action<typeof ActionTypes.ADD_NARRATIVE_HISTORY, string | { text: string }>
  | Action<typeof ActionTypes.SET_NARRATIVE_CONTEXT, unknown>
  | Action<typeof ActionTypes.UPDATE_NARRATIVE, string>
  | Action<typeof ActionTypes.RESET_NARRATIVE>
  | Action<typeof ActionTypes.NAVIGATE_TO_POINT, string>
  | Action<typeof ActionTypes.SELECT_CHOICE, unknown>
  | Action<typeof ActionTypes.SET_DISPLAY_MODE, string>
  | Action<typeof ActionTypes.START_NARRATIVE_ARC, unknown>
  | Action<typeof ActionTypes.COMPLETE_NARRATIVE_ARC, string>
  | Action<typeof ActionTypes.ACTIVATE_BRANCH, string>
  | Action<typeof ActionTypes.COMPLETE_BRANCH, string>;

/**
 * Combat actions
 */
export type CombatAction = 
  | Action<typeof ActionTypes.SET_COMBAT_ACTIVE, boolean>
  | Action<typeof ActionTypes.UPDATE_COMBAT_STATE, unknown>
  | Action<typeof ActionTypes.SET_COMBAT_TYPE, CombatType>
  | Action<typeof ActionTypes.END_COMBAT>
  | Action<typeof ActionTypes.RESET_COMBAT>
  | Action<typeof ActionTypes.SET_COMBATANTS, unknown>
  | Action<typeof ActionTypes.ADD_LOG_ENTRY, unknown>
  | Action<typeof ActionTypes.NEXT_ROUND>
  | Action<typeof ActionTypes.TOGGLE_TURN>
  | Action<typeof ActionTypes.UPDATE_MODIFIERS, unknown>;

/**
 * Game state actions
 */
export type GameStateAction = 
  | Action<typeof ActionTypes.SET_PLAYER, unknown>
  | Action<typeof ActionTypes.ADD_NPC, unknown>
  | Action<typeof ActionTypes.SET_LOCATION, unknown>
  | Action<typeof ActionTypes.ADD_QUEST, unknown>
  | Action<typeof ActionTypes.SET_GAME_PROGRESS, unknown>
  | Action<typeof ActionTypes.SET_SAVED_TIMESTAMP, number>
  | Action<typeof ActionTypes.SET_SUGGESTED_ACTIONS, unknown[]>;

/**
 * UI actions
 */
export type UIAction = 
  | Action<typeof ActionTypes.SET_ACTIVE_TAB, string>
  | Action<typeof ActionTypes.ADD_NOTIFICATION, unknown>
  | Action<typeof ActionTypes.REMOVE_NOTIFICATION, string>
  | Action<typeof ActionTypes.SET_LOADING, boolean>
  | Action<typeof ActionTypes.OPEN_MODAL, unknown>
  | Action<typeof ActionTypes.CLOSE_MODAL>
  | Action<typeof ActionTypes.CLEAR_NOTIFICATIONS>
  | Action<typeof ActionTypes.SET_SOUND_ENABLED, boolean>
  | Action<typeof ActionTypes.SET_MUSIC_ENABLED, boolean>
  | Action<typeof ActionTypes.SET_TEXT_SPEED, string>
  | Action<typeof ActionTypes.SET_FONT_SIZE, string>
  | Action<typeof ActionTypes.SET_THEME, string>;

/**
 * Lore actions
 */
export type LoreAction = 
  | Action<typeof ActionTypes.ADD_LORE_FACT, unknown>
  | Action<typeof ActionTypes.UPDATE_LORE_FACT, unknown>
  | Action<typeof ActionTypes.INVALIDATE_LORE_FACT, string>
  | Action<typeof ActionTypes.VALIDATE_LORE_FACT, string>
  | Action<typeof ActionTypes.ADD_RELATED_FACTS, unknown>
  | Action<typeof ActionTypes.REMOVE_RELATED_FACTS, unknown>
  | Action<typeof ActionTypes.ADD_FACT_TAGS, unknown>
  | Action<typeof ActionTypes.REMOVE_FACT_TAGS, unknown>
  | Action<typeof ActionTypes.PROCESS_LORE_EXTRACTION, unknown>;

/**
 * Error actions
 */
export type ErrorAction = 
  | Action<typeof ActionTypes.NARRATIVE_ERROR, unknown>
  | Action<typeof ActionTypes.CLEAR_ERROR>;

/**
 * Decision actions
 */
export type DecisionAction = 
  | Action<typeof ActionTypes.PRESENT_DECISION, unknown>
  | Action<typeof ActionTypes.RECORD_DECISION, unknown>
  | Action<typeof ActionTypes.CLEAR_CURRENT_DECISION>
  | Action<typeof ActionTypes.PROCESS_DECISION_IMPACTS, unknown>
  | Action<typeof ActionTypes.UPDATE_IMPACT_STATE, unknown>
  | Action<typeof ActionTypes.EVOLVE_IMPACTS>;

/**
 * Story actions
 */
export type StoryAction = 
  | Action<typeof ActionTypes.ADD_STORY_POINT, unknown>
  | Action<typeof ActionTypes.UPDATE_CURRENT_POINT, unknown>
  | Action<typeof ActionTypes.MARK_BRANCHING_POINT_TAKEN, unknown>
  | Action<typeof ActionTypes.RESET_STORY_PROGRESSION>;
