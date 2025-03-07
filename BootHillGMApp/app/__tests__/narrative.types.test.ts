import {
  StoryPoint,
  initialNarrativeState,
  isStoryPoint,
  isNarrativeChoice,
  NarrativeChoice
} from '../types/narrative.types';

describe('Narrative Types', () => {
  it('should import correctly', () => {
    expect(typeof initialNarrativeState).toBe('object');
  });

  it('should have correct initialNarrativeState', () => {
    expect(initialNarrativeState).toEqual({
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
    });
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