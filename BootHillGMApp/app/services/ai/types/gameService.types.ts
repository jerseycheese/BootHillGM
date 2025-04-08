import { Character } from '../../../types/character';
import { InventoryItem } from '../../../types/item.types';
import { LocationType } from '../../locationService';
import { SuggestedAction } from '../../../types/campaign';
import { 
  StoryProgressionData, 
  PlayerDecision, 
  NarrativeContext,
  LoreStore
} from '../../../types/narrative.types';
import { ItemCategory } from '../../../types/item.types'; // Import ItemCategory

/**
 * Defines the structure for AI Game Service response
 * 
 * This is the standard response format returned by the AI Game Master,
 * containing all the information needed to update the game state.
 */
export interface GameServiceResponse {
  /** Narrative text describing the current scene or action results */
  narrative: string;
  
  
  /** Current location information (town, wilderness, etc.) */
  location: LocationType;
  
  /** Whether combat has been initiated */
  combatInitiated?: boolean;
  
  /** Opponent information if in combat */
  opponent?: Character | null;
  
  /** Items acquired during this interaction */
  acquiredItems: { name: string; category?: ItemCategory }[]; // Changed to array of objects
  
  /** Items removed from inventory during this interaction */
  removedItems: string[];
  
  /** Suggested actions for the player */
  suggestedActions: SuggestedAction[];
  
  /** Optional story progression information */
  storyProgression?: StoryProgressionData;
  
  /** Optional player decision point */
  playerDecision?: PlayerDecision;
  
  /** Optional lore extraction results */
  lore?: LoreExtractionResult;
}

/**
 * Defines the structure for lore extraction results
 * 
 * Contains new facts discovered and updates to existing facts
 */
export interface LoreExtractionResult {
  /** New facts discovered during this interaction */
  newFacts: Array<{
    /** Category of the fact (e.g., character, location, event) */
    category: string;
    
    /** Content of the fact */
    content: string;
    
    /** Optional importance rating (1-10) */
    importance?: number;
    
    /** Optional confidence level (0-1) */
    confidence?: number;
    
    /** Optional tags for categorization */
    tags?: string[];
  }>;
  
  /** Updates to existing facts */
  updatedFacts?: Array<{
    /** ID of the existing fact to update */
    id: string;
    
    /** New content for the fact */
    content: string;
    
    /** Optional new importance rating */
    importance?: number;
    
    /** Optional new confidence level */
    confidence?: number;
  }>;
}

/**
 * Define the structure for the fallback response
 * 
 * Used when the AI service is unavailable or times out
 */
export interface FallbackResponse {
  /** Fallback narrative text */
  narrative: string;
  
  /** Default location information */
  location: LocationType;
  
  /** Always false in fallback responses */
  combatInitiated: boolean;
  
  /** Always null in fallback responses */
  opponent: null;
  
  /** Empty in fallback responses */
  acquiredItems: { name: string; category?: ItemCategory }[]; // Match the main interface change
  
  /** Empty in fallback responses */
  removedItems: string[];
  
  /** Generic suggested actions */
  suggestedActions: SuggestedAction[];
}

/**
 * Parameters for getting AI response - Object Style
 * 
 * This is the recommended parameter structure for the getAIResponse function.
 * It provides a more flexible and maintainable approach than positional parameters.
 * 
 * Example usage:
 * ```typescript
 * await getAIResponse({
 *   prompt: "Look around",
 *   journalContext: "You arrived in town yesterday.",
 *   inventory: playerItems,
 *   narrativeContext: currentContext
 * });
 * ```
 */
export interface AIResponseParams {
  /** Player's input text */
  prompt: string;
  
  /** Recent events and narrative context */
  journalContext: string;
  
  /** Current inventory items */
  inventory: InventoryItem[];
  
  /** Optional story progression context */
  storyProgressionContext?: string;
  
  /** Optional narrative context with decision history */
  narrativeContext?: NarrativeContext;
  
  /** Optional lore store with game world facts */
  loreStore?: LoreStore;
}
