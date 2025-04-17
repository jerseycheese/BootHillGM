/**
 * Fallback Decision Generator
 * 
 * Provides fallback decision generation when other methods fail.
 */

import { v4 as uuidv4 } from 'uuid';
import { GameState } from '../types/gameState';
import { PlayerDecision } from '../types/narrative.types';
import { LocationType } from '../services/locationService';
import { cleanNarrativeEntry } from './narrativeContextExtractor';

/**
 * Create a fallback decision when other generation methods fail
 */
export function createFallbackDecision(
  gameState: GameState, 
  locationType?: LocationType
): PlayerDecision {
  // Extract the most recent narrative entry for context
  let contextSnippet = "the current situation";
  if (gameState.narrative?.narrativeHistory?.length > 0) {
    // Get the most recent entries that aren't system metadata
    const recentEntries = gameState.narrative.narrativeHistory.slice(-5);
    const validEntries = recentEntries.filter(entry => 
      entry && 
      typeof entry === 'string' && 
      !entry.includes('STORY_POINT:') &&
      !entry.startsWith('Game Event:') &&
      !entry.startsWith('Context:')
    );
    
    if (validEntries.length > 0) {
      const recentEntry = validEntries[validEntries.length - 1];
      contextSnippet = cleanNarrativeEntry(recentEntry).substring(0, 50) + '...';
    }
  }
  
  return {
    id: `fallback-${uuidv4()}`,
    prompt: `How will you respond to ${contextSnippet}?`,
    timestamp: Date.now(),
    location: locationType,
    options: [
      {
        id: `opt1-${uuidv4()}`,
        text: 'Take a cautious approach',
        impact: 'Proceeding carefully may reveal more information.',
        tags: ['default']
      },
      {
        id: `opt2-${uuidv4()}`,
        text: 'Act decisively',
        impact: 'Quick action might yield immediate results.',
        tags: ['default']
      }
    ],
    context: `Fallback decision based on: ${contextSnippet}`,
    importance: 'moderate',
    characters: [],
    aiGenerated: false
  };
}
