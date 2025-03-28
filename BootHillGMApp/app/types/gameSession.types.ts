import { Character } from '../types/character';
import { CharacterState } from '../types/state/characterState';
import { InventoryState } from '../types/state/inventoryState';
import { JournalState } from '../types/state/journalState';
import { NarrativeState } from '../types/narrative.types';
import { JournalEntry } from '../types/journal';
import { InventoryItem } from '../types/item.types';
import { LocationType } from '../services/locationService';
import { SuggestedAction } from '../types/campaign';

/**
 * Type that encompasses both possible state structures in the application.
 * This handles the various ways different parts of state might be structured.
 */
export type StateWithMixedStructure = {
  currentPlayer?: string;
  npcs?: string[];
  character?: Character | CharacterState | { player?: Character; opponent?: Character };
  location?: LocationType | null;
  savedTimestamp?: number;
  gameProgress?: number;
  journal?: JournalState | JournalEntry[] | { entries?: JournalEntry[] };
  narrative?: NarrativeState | {
    currentStoryPoint?: unknown;
    visitedPoints?: unknown[];
    availableChoices?: unknown[];
    narrativeHistory?: unknown[];
    displayMode?: string;
  };
  inventory?: InventoryState | InventoryItem[] | { items?: InventoryItem[] };
  quests?: string[];
  combat?: { isActive?: boolean; [key: string]: unknown };
  opponent?: Character | null;
  isClient?: boolean;
  suggestedActions?: SuggestedAction[];
  combatState?: unknown;
  [key: string]: unknown;
};

/**
 * Parameters for updating the narrative display
 */
export type UpdateNarrativeParams = {
  text: string;
  playerInput?: string;
  acquiredItems?: string[];
  removedItems?: string[];
};

/**
 * Type for AI response expected from the game service
 */
export type AIGameResponse = {
  narrative: string;
  location?: LocationType;
  combatInitiated?: boolean;
  opponent?: Character;
  acquiredItems?: string[];
  removedItems?: string[];
  suggestedActions?: SuggestedAction[];
};