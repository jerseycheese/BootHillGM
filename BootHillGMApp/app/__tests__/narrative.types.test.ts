import {
  StoryPoint,
  initialNarrativeState,
  isStoryPoint,
  isNarrativeChoice,
  NarrativeChoice,
  initialLoreState,
  // Removed unused initialStoryProgressionState
} from '../types/narrative.types';

// Mock Date.now() for consistent timestamps
const MOCK_DATE = new Date('2024-01-01T00:00:00.000Z');
const RealDate = Date;

describe('Narrative Types', () => {
  beforeAll(() => {
    // @ts-expect-error - Mocking Date constructor
    global.Date = class extends RealDate {
      constructor() {
        super();
        return MOCK_DATE;
      }
      static now() {
        return MOCK_DATE.getTime();
      }
    };
  });

  afterAll(() => {
    global.Date = RealDate; // Restore original Date object
  });

  it('should import correctly', () => {
    expect(typeof initialNarrativeState).toBe('object');
  });

  it('should have correct initialNarrativeState', () => {
    // Define the expected state based on the actual initialNarrativeState definition
    // Ensure all properties are present and use the mocked timestamp
    // Compare relevant parts, ignoring the dynamic lastUpdated timestamp
    expect(initialNarrativeState).toMatchObject({
      currentStoryPoint: null,
      visitedPoints: [],
      availableChoices: [],
      narrativeHistory: [],
      displayMode: 'standard',
      context: '',
      storyProgression: {
        currentPoint: null,
        progressionPoints: {},
        mainStorylinePoints: [],
        branchingPoints: {},
        // lastUpdated is ignored here
      },
      currentDecision: undefined,
      error: null,
      needsInitialGeneration: false,
      lore: initialLoreState,
      // narrativeContext: undefined // Removed as it's not in initialNarrativeState
    });
    // Separately check that lastUpdated is a number
    expect(initialNarrativeState.storyProgression).toBeDefined(); // Check if storyProgression exists
    expect(typeof initialNarrativeState.storyProgression?.lastUpdated).toBe('number'); // Use optional chaining

    // Remove the previous complex comparison logic
  });

  describe('Type Guards', () => {
    it('isStoryPoint should correctly identify StoryPoints', () => {
      const validStoryPoint: StoryPoint = {
        id: 'test-id',
        type: 'exposition',
        title: 'Test Title',
        content: 'Test Content',
      };
      // Cast to Record<string, unknown> to match the function parameter type
      const invalidStoryPoint = { id: 'test', title: 'test' } as Record<string, unknown>;

      // Cast the validStoryPoint to make TypeScript happy
      expect(isStoryPoint(validStoryPoint as unknown as Record<string, unknown>)).toBe(true);
      expect(isStoryPoint(invalidStoryPoint)).toBe(false);
    });

    it('isNarrativeChoice should correctly identify NarrativeChoices', () => {
        const validChoice: NarrativeChoice = {
            id: 'choice1',
            text: 'Go left',
            leadsTo: 'point2'
        };

        const invalidChoice = { id: 'choice1', text: 'Go left' } as Record<string, unknown>;

        // Cast the validChoice to make TypeScript happy
        expect(isNarrativeChoice(validChoice as unknown as Record<string, unknown>)).toBe(true);
        expect(isNarrativeChoice(invalidChoice)).toBe(false);
    });
  });
});