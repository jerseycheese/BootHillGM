/**
 * Narrative Adapter Tests
 * 
 * Tests for the narrative adapter that exposes narrative state
 * properties at the root level for backward compatibility.
 */

import { narrativeAdapter } from '../../../utils/stateAdapters';
import { GameState } from '../../../types/gameState';
import { PartialGameStateWithNarrative } from './testTypes';
import { hasNarrativeContext } from './testHelpers';

describe('narrativeAdapter', () => {
  test('should add narrative context to root level', () => {
    const state: PartialGameStateWithNarrative = {
      narrative: {
        narrativeContext: { location: 'Saloon', time: 'Night' },
        currentStoryPoint: null,
        visitedPoints: [],
        availableChoices: [],
        narrativeHistory: [],
        displayMode: 'default'
      }
    };
    
    const adapted = narrativeAdapter.adaptForTests(state as unknown as GameState);
    
    // Check narrative adaptation
    expect(hasNarrativeContext(adapted)).toBe(true);
    
    if (hasNarrativeContext(adapted)) {
      // Check that narrative properties are accessible at the root level
      expect(adapted.narrativeContext).toEqual(state.narrative!.narrativeContext);
      expect(adapted.currentScene).toBeDefined(); // Check that it exists
      expect(adapted.dialogues).toBeDefined(); // Check that it exists
    }
  });
});