/**
 * Narrative Utilities
 * 
 * Functions for creating and managing narrative state.
 * Handles default narrative state and content updates.
 */

import { NarrativeState, NarrativeDisplayMode } from '../../types/narrative.types';

/**
 * Debug console function for internal logging
 */
const debug = (...args: Array<unknown>): void => {
  console.log('[DEBUG NarrativeUtils]', ...args);
};

/**
 * Create default narrative state for a new game.
 * Initializes narrative with default content and settings.
 * 
 * @returns Default narrative state for new games
 */
const createDefaultNarrativeState = (): NarrativeState => {
  // Empty default narrative text to ensure no text shows before AI-generated content
  const defaultNarrativeText = '';
  
  return {
    currentStoryPoint: {
      id: 'initial',
      type: 'exposition',
      title: 'New Adventure',
      content: defaultNarrativeText,
      choices: []
    },
    visitedPoints: ['initial'],
    narrativeHistory: defaultNarrativeText ? [defaultNarrativeText] : [],
    availableChoices: [],
    displayMode: 'full' as NarrativeDisplayMode,
    context: 'Starting your adventure'
  };
};

/**
 * Update the content in a narrative state.
 * Updates both history and current story point with new content.
 * 
 * @param narrativeState - Narrative state to update
 * @param content - New content to set
 */
const updateNarrativeContent = (narrativeState: NarrativeState, content: string): void => {
  if (narrativeState.narrativeHistory && narrativeState.narrativeHistory.length > 0) {
    narrativeState.narrativeHistory[0] = content;
  } else if (narrativeState.narrativeHistory) {
    narrativeState.narrativeHistory.push(content);
  } else {
    narrativeState.narrativeHistory = [content];
  }
  
  if (narrativeState.currentStoryPoint) {
    narrativeState.currentStoryPoint.content = content;
  }
  
  debug('Updated narrative content');
};

/**
 * Retrieve a saved narrative entry from storage if available.
 * Handles multiple storage formats for backward compatibility.
 * 
 * @param storageKey - Storage key to check
 * @returns - Saved narrative content or empty string if not found
 */
const getSavedNarrativeEntry = (storageKey: string): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    const data = localStorage.getItem(storageKey);
    if (!data) return '';
    
    const parsed = JSON.parse(data);
    
    // Check for different narrative storage formats
    if (typeof parsed === 'string') {
      return parsed;
    } 
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      return typeof parsed[0] === 'string' ? parsed[0] : '';
    }
    
    if (parsed && typeof parsed === 'object') {
      if ('narrative' in parsed && typeof parsed.narrative === 'string') {
        return parsed.narrative;
      }
      
      if ('narrativeHistory' in parsed && 
          Array.isArray(parsed.narrativeHistory) && 
          parsed.narrativeHistory.length > 0) {
        return typeof parsed.narrativeHistory[0] === 'string' ? parsed.narrativeHistory[0] : '';
      }
      
      if ('content' in parsed && typeof parsed.content === 'string') {
        return parsed.content;
      }
    }
  } catch (e) {
    debug(`Error retrieving narrative from ${storageKey}:`, e);
  }
  
  return '';
};

/**
 * Public API for narrative utility functions.
 */
export const narrativeUtils = {
  createDefaultNarrativeState,
  updateNarrativeContent,
  getSavedNarrativeEntry
};
