import { Character } from './character';
import { JournalEntry } from './journal';
import { InventoryItem } from './item.types';
import { CombatState } from './combat';
import { LocationType } from '../services/locationService';
import { StoryProgressionState, NarrativeState, initialNarrativeState } from './narrative.types';

/**
 * Defines the structure of a suggested action in the campaign.
 * 
 * @property text - The description of the action
 * @property type - The type of the action ('basic', 'combat', 'interaction', 'chaotic', 'inventory')
 * @property context - Optional tooltip explanation for the action
 */
export interface SuggestedAction {
  text: string;
  type: 'basic' | 'combat' | 'interaction' | 'chaotic' | 'inventory';
  context?: string;
}

// Define the structure of the campaign state
/**
 * Defines the structure of the campaign state.
 * 
 * @property currentPlayer - The current player's identifier
 * @property npcs - List of NPC identifiers
 * @property character - The player's character object
 * @property location - The current location in the game
 * @property savedTimestamp - Optional timestamp of when the game state was last saved
 * @property gameProgress - The current progress of the game
 * @property journal - List of journal entries
 * @property narrative - The current narrative state, including text and story progression
 * @property inventory - List of inventory items
 * @property quests - List of quest identifiers
 * @property isCombatActive - Boolean indicating if combat is active
 * @property opponent - The opponent character object if combat is active
 * @property isClient - Optional boolean indicating if the state is on the client side
 * @property suggestedActions - List of suggested actions for the player
 */
export interface CampaignState {
  currentPlayer: string;
  npcs: string[];
  character: Character | null;
  location: LocationType | null;
  savedTimestamp?: number;
  gameProgress: number;
  journal: JournalEntry[];
  narrative: NarrativeState;
  inventory: InventoryItem[];
  quests: string[];
  isCombatActive: boolean;
  opponent: Character | null;
  isClient?: boolean;
  suggestedActions: SuggestedAction[];
  combatState?: CombatState;
  error?: string | null;
  
  // For backward compatibility with GameState interface
  get player(): Character | null;
}

/**
 * Initial state of the campaign.
 */
export const initialGameState: CampaignState = {
  currentPlayer: '',
  npcs: [],
  character: null,
  location: null,
  gameProgress: 0,
  journal: [],
  narrative: initialNarrativeState,
  inventory: [],
  quests: [],
  isCombatActive: false,
  opponent: null,
  isClient: false,
  suggestedActions: [],
  combatState: undefined,
  
  // For backward compatibility
  get player() {
    return this.character;
  }
};

// Union type of all possible actions
/**
 * Union type of all possible actions that can be dispatched to update the campaign state.
 */
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
  | { type: 'SET_NARRATIVE'; payload: { text: string; storyProgression?: Partial<StoryProgressionState> } }
  | { type: 'SET_GAME_PROGRESS'; payload: number }
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry | JournalEntry[] }
  | { type: 'SET_COMBAT_ACTIVE'; payload: boolean }
  | { type: 'SET_OPPONENT'; payload: Character | null }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAN_INVENTORY' }
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'SET_SAVED_TIMESTAMP'; payload: number }
  | { type: 'SET_STATE'; payload: Partial<CampaignState> }
  | { type: 'SET_SUGGESTED_ACTIONS'; payload: SuggestedAction[] };

// Export GameState type alias for compatibility
/**
 * Type alias for CampaignState for compatibility.
 */
export type GameState = CampaignState;
