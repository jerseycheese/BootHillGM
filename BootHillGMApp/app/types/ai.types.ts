/**
 * AI Types
 * 
 * Type definitions for AI service responses and related functionality,
 * specifically for narrative gameplay responses.
 */

import { LocationType } from '../services/locationService';
import { Character } from './character'; 
import { SuggestedAction } from './campaign'; 
import { NarrativeContext, StoryProgressionData, PlayerDecision } from './narrative.types';
import { ItemCategory } from './item.types'; // Import ItemCategory

/**
 * Opponent information in an AI response
 */
export interface Opponent {
  name: string;
  strength?: number; // Can be directly on opponent or in attributes
  health?: number;   // Can be directly on opponent or in attributes
  attributes?: {
    strength?: number;
    health?: number;
    speed?: number;
    gunAccuracy?: number;
    throwingAccuracy?: number;
    baseStrength?: number;
    bravery?: number;
    experience?: number;
    [key: string]: string | number | undefined; 
  };
}

/**
 * Raw response structure expected directly from the getAIResponse service
 */
export interface AIResponseRaw {
  narrative: string;
  location: LocationType;
  combatInitiated?: boolean;
  opponent?: Character | null; 
  acquiredItems: { name: string; category?: ItemCategory }[]; // Match GameServiceResponse
  removedItems: string[];
  suggestedActions: SuggestedAction[];
  storyProgression?: StoryProgressionData;
  playerDecision?: PlayerDecision; 
}

/**
 * Extended AI Response that includes lore data
 * This interface is used for extracting lore from AI responses
 */
export interface AIResponse extends AIResponseRaw {
  lore?: {
    newFacts: Array<{
      category: string;
      content: string;
      importance?: number;
      confidence?: number;
      relatedFactIds?: string[];
      tags?: string[];
    }>;
    updatedFacts?: Array<{
      id: string;
      content: string;
      importance?: number;
      confidence?: number;
    }>;
  };
}

/**
 * Result returned by the useAIWithOptimizedContext hook, including metadata.
 * It inherits most properties from AIResponseRaw but overrides 'opponent'
 * and adds 'contextQuality'.
 */
export interface AIRequestResult extends Omit<AIResponseRaw, 'opponent' | 'narrative'> {
  opponent?: Opponent;
  narrative?: string; 

  /* Inherited:
   * location: LocationType;
   * combatInitiated?: boolean;
   * acquiredItems: string[]; 
   * removedItems: string[];
   * suggestedActions: SuggestedAction[];
   * storyProgression?: StoryProgressionData;
   * playerDecision?: PlayerDecision; 
   */

  contextQuality?: {
    optimized: boolean;
    compressionLevel: string;
    tokensUsed: number;
    buildTimeMs: number;
  };

  acquiredItems: { name: string; category?: ItemCategory }[]; // Match GameServiceResponse and AIResponseRaw change
  removedItems: string[];
  suggestedActions: SuggestedAction[];
  storyProgression?: StoryProgressionData; 
  playerDecision?: PlayerDecision; 

  narrativeContext?: NarrativeContext;
}
