/**
 * AI Types
 * 
 * Type definitions for AI service responses and related functionality,
 * specifically for narrative gameplay responses.
 */

import { LocationType } from '../services/locationService';
import { NarrativeContext } from './narrative.types';

/**
 * Opponent information in an AI response
 */
export interface Opponent {
  name: string;
  strength?: number;
  health?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Result of an AI request with narrative information
 */
export interface AIRequestResult {
  /**
   * Narrative text response from the AI
   */
  narrative?: string;
  
  /**
   * Location change triggered by the AI response
   */
  location?: LocationType | string;
  
  /**
   * Whether combat was initiated by this response
   */
  combatInitiated?: boolean;
  
  /**
   * Opponent information if combat was initiated
   */
  opponent?: Opponent;
  
  /**
   * Items acquired during this interaction
   */
  acquiredItems?: string[];
  
  /**
   * Items removed during this interaction
   */
  removedItems?: string[];
  
  /**
   * Story progression information
   */
  storyProgression?: {
    title?: string;
    description: string;
    importance?: 'minor' | 'significant' | 'major';
  };
  
  /**
   * Context quality metadata for optimization
   */
  contextQuality?: {
    optimized: boolean;
    compressionLevel: string;
    tokensUsed: number;
    buildTimeMs: number;
  };
  
  /**
   * Optional narrative context update
   */
  narrativeContext?: NarrativeContext;
  
  /**
   * Additional data returned by AI
   */
  [key: string]: string | number | boolean | object | undefined;
}
