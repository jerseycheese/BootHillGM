import { Character } from './character';
import { JournalEntry } from './journal';
import { InventoryItem } from './inventory';

// Define the structure of the campaign state
export interface CampaignState {
  currentPlayer: string;
  npcs: string[];
  character: Character | null;
  location: string;
  savedTimestamp?: number;
  gameProgress: number;
  journal: JournalEntry[];
  narrative: string;
  inventory: InventoryItem[];
  quests: string[];
  isCombatActive: boolean;
  opponent: Character | null;
  isClient?: boolean;
}

export const initialGameState: CampaignState = {
  currentPlayer: '',
  npcs: [],
  character: null,
  location: '',
  gameProgress: 0,
  journal: [],
  narrative: '',
  inventory: [],
  quests: [],
  isCombatActive: false,
  opponent: null,
  isClient: false
};


// Union type of all possible actions
export type GameAction =
  | { type: 'SET_PLAYER'; payload: string }
  | { type: 'ADD_NPC'; payload: string }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'USE_ITEM'; payload: string }
  | { type: 'ADD_QUEST'; payload: string }
  | { type: 'SET_CHARACTER'; payload: Character | null }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
  | { type: 'SET_NARRATIVE'; payload: string }
  | { type: 'SET_GAME_PROGRESS'; payload: number }
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry | JournalEntry[] }
  | { type: 'SET_COMBAT_ACTIVE'; payload: boolean }
  | { type: 'SET_OPPONENT'; payload: Character | null }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAN_INVENTORY' }
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'SET_SAVED_TIMESTAMP'; payload: number }
  | { type: 'SET_STATE'; payload: Partial<CampaignState> };

// Export GameState type alias for compatibility
export type GameState = CampaignState;
