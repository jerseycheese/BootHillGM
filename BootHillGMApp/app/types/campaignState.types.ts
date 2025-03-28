import { GameEngineAction } from './gameActions';
import { GameState } from './gameState';
import { Character } from './character';
import { InventoryItem } from './item.types';
import { JournalEntry } from './journal';
import { NarrativeContext } from './narrative/context.types';
import { CombatState } from './state/combatState';

/**
 * Type definition for the normalized state with partial combat state.
 * This interface represents the state format used for storage and compatibility
 * with different versions of the game state structure.
 */
export interface NormalizedState extends Record<string, unknown> {
  inventory?: InventoryItem[] | { items?: InventoryItem[] };
  npcs?: Character[];
  journal?: { entries?: JournalEntry[] };
  combat?: Partial<CombatState> & { isActive?: boolean };
  character?: {
    player?: Character;
    opponent?: Character;
  };
  narrative?: unknown;
}

/**
 * Context type for the CampaignStateContext.
 * Includes both the core state management properties and
 * legacy getters for backward compatibility.
 */
export interface CampaignStateContextType {
  /** The current game state */
  state: GameState;
  /** Dispatch function for sending actions to update state */
  dispatch: React.Dispatch<GameEngineAction>;
  /** Function to save the current game state to localStorage */
  saveGame: (state: GameState) => void;
  /** Function to load game state from localStorage */
  loadGame: () => GameState | null;
  /** Function to reset the game state to a clean state */
  cleanupState: () => void;
  
  // Legacy getters for backward compatibility
  /** Legacy getter for player character */
  player: Character | null; 
  /** Legacy getter for opponent character */
  opponent: Character | null;
  /** Legacy getter for inventory items */
  inventory: InventoryItem[];
  /** Legacy getter for journal entries */
  entries: JournalEntry[];
  /** Legacy getter for combat active status */
  isCombatActive: boolean;
  /** Legacy getter for narrative context */
  narrativeContext: NarrativeContext | undefined;
}
