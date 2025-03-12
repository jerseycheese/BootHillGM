import { InventoryItem } from '../../types/item.types';
import { Character } from '../../types/character';
import { SuggestedAction } from '../../types/campaign';
import { PlayerDecision } from '../../types/narrative.types';
import { LocationType } from '../locationService';

/**
 * Configuration for the AI model.
 * @property modelName - Name of the model to use
 * @property maxRetries - Maximum number of retries on API failure
 * @property temperature - Randomness parameter (0-1)
 */
export interface AIConfig {
    modelName: string;
    maxRetries: number;
    temperature: number;
}

/**
 * Options for constructing AI prompts.
 * @property inventory - Optional player inventory items
 * @property character - Optional character information
 * @property location - Optional location information
 */
export interface PromptOptions {
    inventory?: InventoryItem[];
    character?: Character;
    location?: string;
}

/**
 * Structured response from AI model after parsing.
 * Contains game state information extracted from the raw AI response.
 * 
 * @property narrative - Main narrative text response
 * @property location - Current location information
 * @property combatInitiated - Whether combat has been initiated
 * @property opponent - Opponent character if in combat
 * @property acquiredItems - Items the player acquired
 * @property removedItems - Items the player used or lost
 * @property suggestedActions - Actions suggested by the AI
 * @property playerDecision - Decision point for the player (if applicable)
 */
export interface AIResponse {
    narrative: string;
    location?: LocationType;
    combatInitiated?: boolean;
    opponent?: Character;
    acquiredItems: string[];
    removedItems: string[];
    suggestedActions: SuggestedAction[];
    playerDecision?: PlayerDecision;
}

/**
 * Extended AI response that includes the raw text.
 * Used for debugging and logging purposes.
 * 
 * @property raw - Original raw response from the AI
 */
export interface ParsedResponse extends AIResponse {
    raw: string;
}
