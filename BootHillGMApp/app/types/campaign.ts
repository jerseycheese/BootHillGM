// BootHillGMApp/app/types/campaign.ts

import { Character } from './character';
import { JournalEntry } from './journal';
import { InventoryItem } from './inventory';

// Define the structure of the campaign state
export interface CampaignState {
  character: Character | null;  // The player's character
  location: string;             // Current location in the game world
  savedTimestamp: number | null; // Timestamp of the last save
  gameProgress: number;         // Numeric representation of game progress
  journal: JournalEntry[];      // List of journal entries
  narrative: string;            // Current narrative text
  inventory: InventoryItem[];   // Player's inventory
  isCombatActive: boolean;      // Whether combat is currently active
  opponent: Character | null;   // Current opponent in combat, if any
}

// Union type of all possible actions
export type GameAction =
  | { type: 'SET_CHARACTER'; payload: Character | null }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'SET_GAME_PROGRESS'; payload: number }
  | { type: 'UPDATE_JOURNAL'; payload: string | JournalEntry | JournalEntry[] }
  | { type: 'SET_JOURNAL'; payload: JournalEntry[] }
  | { type: 'SET_NARRATIVE'; payload: string }
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'SET_COMBAT_ACTIVE'; payload: boolean }
  | { type: 'SET_OPPONENT'; payload: Character | null }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SET_SAVED_TIMESTAMP'; payload: number | null }
  | { type: 'SET_STATE'; payload: CampaignState }; // Allows setting the entire state at once
