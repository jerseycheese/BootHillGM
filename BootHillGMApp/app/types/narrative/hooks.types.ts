/**
 * Narrative Hook Interface Types
 * 
 * This file defines interface types for hooks used in the narrative system.
 */

import { NarrativeChoice } from './choice.types';
import { NarrativeSegment } from './segment.types';
import { LocationType } from '../../services/locationService';

/**
 * Defines a hook for handling player choices
 */
export interface UseNarrativeChoiceResult {
  availableChoices: NarrativeChoice[];
  selectChoice: (choiceId: string) => void;
  canSelectChoice: (choiceId: string) => boolean;
}

/**
 * Defines a hook for processing narrative segments
 */
export interface UseNarrativeProcessorResult {
  processedSegments: NarrativeSegment[];
  addPlayerAction: (action: string) => void;
  addGMResponse: (response: string, location?: LocationType) => void;
  addNarrativeSegment: (segment: NarrativeSegment) => void;
  clearSegments: () => void;
  processNarrative: (narrative: string, location?: LocationType) => void;
}