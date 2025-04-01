import {
  StoryPoint,
  initialNarrativeState,
  isStoryPoint,
  isNarrativeChoice,
  NarrativeChoice,
  initialLoreState
} from '../types/narrative.types';

describe('Narrative Types', () => {
  it('should import correctly', () => {
    expect(typeof initialNarrativeState).toBe('object');
  });

  it('should have correct initialNarrativeState', () => {
    // The initialNarrativeState now includes lore and narrativeContext
    // Creating the expected state manually with the updated structure
    const expectedState = {
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      narrativeContext: undefined,
      error: null,
      lore: initialLoreState,
      context: "" // Add missing context property from initialNarrativeState
    };
    
    expect(initialNarrativeState).toEqual(expectedState);
  });

  describe('Type Guards', () => {
    it('isStoryPoint should correctly identify StoryPoints', () => {
      const validStoryPoint: StoryPoint = {
        id: 'test-id',
        type: 'exposition',
        title: 'Test Title',
        content: 'Test Content',
      };
      const invalidStoryPoint = { id: 'test', title: 'test' };

      expect(isStoryPoint(validStoryPoint)).toBe(true);
      expect(isStoryPoint(invalidStoryPoint)).toBe(false);
    });

    it('isNarrativeChoice should correctly identify NarrativeChoices', () => {
        const validChoice: NarrativeChoice = {
            id: 'choice1',
            text: 'Go left',
            leadsTo: 'point2'
        };

        const invalidChoice = { id: 'choice1', text: 'Go left' };

        expect(isNarrativeChoice(validChoice)).toBe(true);
        expect(isNarrativeChoice(invalidChoice)).toBe(false);
    });
  });
});