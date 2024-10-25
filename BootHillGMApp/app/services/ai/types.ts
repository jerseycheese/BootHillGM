import { InventoryItem } from '../../types/inventory';
import { Character } from '../../types/character';

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
}

export interface ParsedResponse extends AIResponse {
  raw: string;
}
