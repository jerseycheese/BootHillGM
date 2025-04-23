/**
 * Story Point Types
 * 
 * This file defines types related to story points in the narrative.
 */

import { JournalEntry } from '../journal';
import { LocationType } from '../../services/locationService';
import { NarrativeChoice } from './choice.types';

/**
 * Represents the type of a story point
 */
export type StoryPointType =
  | 'narrative'
  | 'exposition'     // Background information and scene-setting
  | 'decision'       // Player needs to make a choice
  | 'action'         // Requires player to take an action
  | 'revelation'     // Key information is revealed
  | 'transition'     // Moving between scenes/areas
  | 'combat-intro'   // Leads into combat
  | 'resolution'     // Concludes a narrative arc
  | 'dialogue';

/**
 * Represents the significance level of a story point in the narrative
 */
export type StorySignificance =
  | 'major'         // A critical point in the main storyline
  | 'minor'         // A less significant but still noteworthy story point
  | 'background'    // Background information or world-building
  | 'character'     // Character development moment
  | 'milestone';    // Achievement or significant accomplishment

/**
 * Defines a single point in the narrative structure
 * 
 * @property id - Unique identifier for this story point
 * @property type - The type of story point
 * @property title - Short descriptive title
 * @property content - The narrative text content
 * @property choices - Available choices (if type is 'decision')
 * @property aiPrompt - Optional prompt for AI narrative generation
 * @property locationChange - Optional location to transition to
 * @property itemsGranted - Optional items given at this point
 * @property itemsRemoved - Optional items taken at this point
 * @property journalEntry - Optional journal entry to add
 * @property tags - Optional tags for categorization and filtering
 */
export interface StoryPoint {
  id: string;
  type: StoryPointType;
  title: string;
  content: string;
  choices?: NarrativeChoice[];
  aiPrompt?: string;
  locationChange?: LocationType;
  itemsGranted?: string[];
  itemsRemoved?: string[];
  journalEntry?: Omit<JournalEntry, 'timestamp'>;
  tags?: string[];
}