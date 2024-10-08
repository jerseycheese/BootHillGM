// BootHillGMApp/app/types/campaign.ts

// Import necessary types from other files
import { Character } from './character';
import { JournalEntry } from './journal';
import { InventoryItem } from './inventory';

// Define the structure of the game's campaign state
export interface CampaignState {
  character: Character | null;
  currentLocation: string;
  gameProgress: number;
  journal: JournalEntry[];
  narrative: string;
  inventory: InventoryItem[];
  isCombatActive: boolean;
  opponent: Character | null;
}

export type CharacterActionType = { type: 'SET_CHARACTER'; payload: Character | null } |
    { type: 'UPDATE_CHARACTER_HEALTH'; payload: number };

export type LocationActionType = { type: 'SET_LOCATION'; payload: string };

export type GameProgressActionType = { type: 'SET_GAME_PROGRESS'; payload: number };

export type JournalActionType = { type: 'UPDATE_JOURNAL'; payload: JournalEntry[] };

export type NarrativeActionType = { type: 'SET_NARRATIVE'; payload: string };

// Define action types for inventory management
export type InventoryActionType = 
    | { type: 'ADD_ITEM'; payload: InventoryItem }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'SET_INVENTORY'; payload: InventoryItem[] };

export type CombatActionType = { type: 'SET_COMBAT_ACTIVE'; payload: boolean } |
    { type: 'SET_OPPONENT'; payload: Character | null };

    // Combine all action types into a single union type
export type Action =
    | CharacterActionType
    | LocationActionType
    | GameProgressActionType
    | JournalActionType
    | NarrativeActionType
    | InventoryActionType
    | CombatActionType;