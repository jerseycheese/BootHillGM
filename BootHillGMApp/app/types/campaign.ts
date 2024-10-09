// BootHillGMApp/app/types/campaign.ts

import { Character } from './character';
import { JournalEntry } from './journal';
import { InventoryItem } from './inventory';

// Defines the structure of the overall campaign state
export interface CampaignState {
  character: Character | null;  // The player's character
  location: string;             // Current location in the game world
  gameProgress: number;         // Numeric representation of game progress
  journal: JournalEntry[];      // List of journal entries
  narrative: string;            // Current narrative text
  inventory: InventoryItem[];   // Player's inventory
  isCombatActive: boolean;      // Whether combat is currently active
  opponent: Character | null;   // Current opponent in combat, if any
}

// Action types for updating different aspects of the campaign state

// For updating the player character
export type CharacterActionType = { type: 'SET_CHARACTER'; payload: Character | null };

// For updating the current location
export type LocationActionType = { type: 'SET_LOCATION'; payload: string };

// For updating the game progress
export type GameProgressActionType = { type: 'SET_GAME_PROGRESS'; payload: number };

// For updating the journal
export type JournalActionType = 
  | { type: 'UPDATE_JOURNAL'; payload: string | JournalEntry }  // Add a new entry
  | { type: 'SET_JOURNAL'; payload: JournalEntry[] };           // Set the entire journal

// For updating the narrative
export type NarrativeActionType = { type: 'SET_NARRATIVE'; payload: string };

// For updating the inventory
export type InventoryActionType = 
  | { type: 'ADD_ITEM'; payload: InventoryItem }    // Add an item
  | { type: 'REMOVE_ITEM'; payload: string }        // Remove an item by ID
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] };  // Set the entire inventory

// For updating combat-related state
export type CombatActionType = 
  | { type: 'SET_COMBAT_ACTIVE'; payload: boolean }  // Set whether combat is active
  | { type: 'SET_OPPONENT'; payload: Character | null };  // Set the current opponent

// Union type of all possible game actions
export type GameAction =
  | CharacterActionType
  | LocationActionType
  | GameProgressActionType
  | JournalActionType
  | NarrativeActionType
  | InventoryActionType
  | CombatActionType;