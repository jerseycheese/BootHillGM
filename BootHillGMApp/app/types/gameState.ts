import { Character } from './character';
import { LocationType } from '../services/locationService';
import {
  CharacterState,
  CombatState,
  InventoryState,
  JournalState,
  NarrativeState,
  UIState
} from './state';
import { initialState } from './initialState';
import { SuggestedAction } from './campaign';

/**
 * Combined game state that uses domain-specific slices
 */
export interface GameState {
  // Domain-specific slices
  character: CharacterState | null;  // Allow null for character state
  combat: CombatState;
  inventory: InventoryState;
  journal: JournalState;
  narrative: NarrativeState;
  ui: UIState;
  
  // Top-level state that doesn't fit into slices
  currentPlayer: string;
  npcs: string[];
  location: LocationType | null;
  quests: string[];
  gameProgress: number;
  savedTimestamp?: number;
  isClient?: boolean;
  suggestedActions: SuggestedAction[]; // Added suggestedActions property
  
  // Legacy getters for backward compatibility
  get player(): Character | null;
  get opponent(): Character | null; // Added for test compatibility
  get isCombatActive(): boolean;
}

// Re-export initialState as initialGameState for backward compatibility
export { initialState as initialGameState };
