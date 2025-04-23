import { 
  extractStoryPointFromNarrative,
  createStoryProgressionPoint,
  addStoryPoint,
  containsSignificantStoryAdvancement,
  generateStoryProgressionSummary
} from '../../utils/storyUtils';
import { StoryProgressionState, initialStoryProgressionState } from '../../types/narrative.types';

describe('Story Utils', () => {
  describe('extractStoryPointFromNarrative', () => {
    it('should extract JSON-formatted story point', () => {
      const narrative = `You discover a hidden map. STORY_POINT: { title: "Hidden Map Discovery", significance: "major", characters: "Player, Sheriff" }`;
      const result = extractStoryPointFromNarrative(narrative);
      
      expect(result).toBeTruthy();
      expect(result?.title).toBe('Hidden Map Discovery');
      expect(result?.significance).toBe('major');
      expect(result?.characters).toEqual(['Player', 'Sheriff']);
    });

    it('should extract multi-line story point', () => {
      const narrative = `
        You find a clue.
        STORY_POINT:
        title: Important Clue
        significance: minor
        characters: Player
      `;
      const result = extractStoryPointFromNarrative(narrative);
      
      expect(result).toBeTruthy();
      expect(result?.title).toBe('Important Clue');
      expect(result?.significance).toBe('minor');
    });

    it('should return null for narrative without story point', () => {
      const narrative = 'Just a regular narrative with no story points.';
      const result = extractStoryPointFromNarrative(narrative);
      
      expect(result).toBeNull();
    });
  });

  describe('createStoryProgressionPoint', () => {
    it('should create a valid story point from data', () => {
      const data = {
        title: 'Test Story Point',
        description: 'Test description',
        significance: 'major' as const,
        characters: ['Character1', 'Character2']
      };
      
      const narrative = 'Full narrative text';
      const result = createStoryProgressionPoint(data, narrative);
      
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Test Story Point');
      expect(result.description).toBe('Test description');
      expect(result.significance).toBe('major');
      expect(result.characters).toEqual(['Character1', 'Character2']);
      expect(result.timestamp).toBeDefined();
      expect(result.aiGenerated).toBe(true);
    });

    it('should use defaults for missing fields', () => {
      const data = {
        title: 'Just a Title'
      };
      
      const narrative = 'This is the full narrative text that should be used for description.';
      const result = createStoryProgressionPoint(data, narrative);
      
      expect(result.title).toBe('Just a Title');
      expect(result.description).toBe(narrative);
      expect(result.significance).toBe('minor');
      expect(result.characters).toEqual([]);
    });
  });

  describe('addStoryPoint', () => {
    it('should add a story point to the state', () => {
      const initialState: StoryProgressionState = { 
        ...initialStoryProgressionState 
      };
      
      const point = {
        id: 'test-id',
        title: 'Test Point',
        description: 'Test description',
        significance: 'major' as const,
        characters: ['Character1'],
        timestamp: Date.now(),
        aiGenerated: true,
        tags: []
      };
      
      const result = addStoryPoint(initialState, point);
      
      expect(result.progressionPoints['test-id']).toEqual(point);
      expect(result.currentPoint).toBe('test-id');
      expect(result.mainStorylinePoints).toContain('test-id');
    });

    it('should not add minor points to main storyline', () => {
      const initialState: StoryProgressionState = { 
        ...initialStoryProgressionState 
      };
      
      const point = {
        id: 'minor-point',
        title: 'Minor Point',
        description: 'Minor description',
        significance: 'minor' as const,
        characters: [],
        timestamp: Date.now(),
        aiGenerated: true,
        tags: []
      };
      
      const result = addStoryPoint(initialState, point);
      
      expect(result.progressionPoints['minor-point']).toEqual(point);
      expect(result.mainStorylinePoints).not.toContain('minor-point');
    });
  });

  describe('containsSignificantStoryAdvancement', () => {
    it('should detect significant story keywords', () => {
      expect(containsSignificantStoryAdvancement('You discovered a secret entrance.')).toBe(true);
      expect(containsSignificantStoryAdvancement('This is a crucial moment in the story.')).toBe(true);
      expect(containsSignificantStoryAdvancement('You completed the mission successfully.')).toBe(true);
    });

    it('should return false for regular narrative', () => {
      expect(containsSignificantStoryAdvancement('You walk into the saloon.')).toBe(false);
      expect(containsSignificantStoryAdvancement('The weather is nice today.')).toBe(false);
    });
  });

  describe('generateStoryProgressionSummary', () => {
    it('should generate a summary for story points', () => {
      const state: StoryProgressionState = {
        currentPoint: 'point2',
        progressionPoints: {
          'point1': {
            id: 'point1',
            title: 'First Point',
            description: 'Description of first point',
            significance: 'major',
            characters: [],
            timestamp: 1000,
            aiGenerated: true,
            tags: []
          },
          'point2': {
            id: 'point2',
            title: 'Second Point',
            description: 'Description of second point',
            significance: 'major',
            characters: [],
            timestamp: 2000,
            aiGenerated: true,
            tags: []
          }
        },
        mainStorylinePoints: ['point1', 'point2'],
        branchingPoints: { /* Intentionally empty */ },
        lastUpdated: 3000
      };
      
      const summary = generateStoryProgressionSummary(state, 2);
      
      expect(summary).toContain('First Point');
      expect(summary).toContain('Second Point');
      expect(summary).toContain('Description of first point');
      expect(summary).toContain('Description of second point');
    });

    it('should return default message when no points exist', () => {
      const summary = generateStoryProgressionSummary(initialStoryProgressionState);
      
      expect(summary).toBe('No significant story events have occurred yet.');
    });
  });
});
