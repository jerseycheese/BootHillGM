import { Character } from './character';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

export interface CampaignState {
  character: Character | null;
  currentLocation: string;
  gameProgress: number;
  journal: JournalEntry[];
  narrative: string;
  inventory: InventoryItem[];
}

export interface JournalEntry {
  timestamp: number;
  content: string;
}

export type Action =
  | { type: 'SET_CHARACTER'; payload: Character | null }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'SET_GAME_PROGRESS'; payload: number }
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry | JournalEntry[] }
  | { type: 'SET_NARRATIVE'; payload: string }
  | { type: 'ADD_ITEM'; payload: InventoryItem | InventoryItem[] }
  | { type: 'REMOVE_ITEM'; payload: string };