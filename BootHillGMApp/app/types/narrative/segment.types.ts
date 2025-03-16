/**
 * Narrative Segment Types
 * 
 * This file defines types related to narrative segments for display and processing.
 */

/**
 * Defines a narrative segment that can be processed and displayed
 */
export interface NarrativeSegment {
  type: 'player-action' | 'gm-response' | 'narrative' | 'item-update';
  content: string;
  metadata?: {
    items?: string[];
    updateType?: 'acquired' | 'used';
    timestamp?: number;
    isEmpty?: boolean;
  };
}