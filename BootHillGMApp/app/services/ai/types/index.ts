/**
 * Types for AI services
 */

import { PlayerDecision } from '../../../types/narrative.types';
import { LocationType } from '../../locationService';
import { InventoryItem } from '../../../types/item.types';
import { Character } from '../../../types/character';
import { SuggestedAction } from '../../../types/campaign';

/**
 * Opponent character in combat
 */
export interface AIOpponent {
  name: string;
  attributes: {
    speed: number;
    gunAccuracy: number;
    throwingAccuracy: number;
    strength: number;
    baseStrength: number;
    bravery: number;
    experience: number;
  };
  inventory?: InventoryItem[];
  weapon?: {
    name: string;
    ammunition: number;
    maxAmmunition: number;
  };
  wounds?: string[];
  isUnconscious?: boolean;
}

/**
 * Response from the AI service
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
