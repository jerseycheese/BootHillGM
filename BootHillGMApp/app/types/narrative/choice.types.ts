/**
 * Narrative Choice and Display Mode Types
 * 
 * This file defines types related to narrative choices and display modes.
 */

import { Character } from '../character';

/**
 * Defines a narrative choice option that can be presented to the player
 * 
 * @property id - Unique identifier for the choice
 * @property text - Display text for the choice
 * @property consequence - Optional description of the consequence
 * @property requiresItem - Optional item requirement to enable this choice
 * @property requiresAttribute - Optional character attribute requirement
 * @property leadsTo - ID of the StoryPoint this choice leads to
 */
export interface NarrativeChoice {
  id: string;
  text: string;
  consequence?: string;
  requiresItem?: string;
  requiresAttribute?: {
    attribute: keyof Character['attributes'];
    minValue: number;
  };
  leadsTo: string;
}

/**
 * Defines how narrative should be presented
 */
export type NarrativeDisplayMode = 
  | 'standard'       // Normal narrative display
  | 'flashback'      // Presented as a memory or past event
  | 'dream'          // Presented as a dream sequence
  | 'letter'         // Presented as written correspondence
  | 'journal'        // Presented as a journal entry
  | 'dialogue';      // Focus on character dialogue