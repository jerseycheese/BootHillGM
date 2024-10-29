import { InventoryItem } from '../../types/inventory';
import { Character } from '../../types/character';
import { SuggestedAction } from '../../types/campaign';

export interface AIConfig {
  modelName: string;
  maxRetries: number;
  temperature: number;
}

export interface PromptOptions {
  inventory?: InventoryItem[];
  character?: Character;
  location?: string;
}

export interface AIResponse {
  narrative: string;
  location?: string;
  combatInitiated?: boolean;
  opponent?: Character;
  acquiredItems: string[];
  removedItems: string[];
  suggestedActions: SuggestedAction[];
}

export interface ParsedResponse extends AIResponse {
  raw: string;
}
