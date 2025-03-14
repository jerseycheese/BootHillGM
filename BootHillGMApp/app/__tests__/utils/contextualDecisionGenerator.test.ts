import { 
  extractContextFromGameState,
  findBestTemplateMatch,
  generateContextualDecision,
  templateToDecision
} from '../../utils/contextualDecisionGenerator';
import { 
  DecisionTemplate,
} from '../../utils/decisionTemplates';
import { initialGameState } from '../../types/gameState';
import { NarrativeDisplayMode, NarrativeContext, StoryPoint, NarrativeArc, ImpactState, NarrativeBranch } from '../../types/narrative.types';
import { LocationType } from '../../services/locationService';

describe('contextualDecisionGenerator', () => {
  describe('extractContextFromGameState', () => {
    it('extracts location type from game state', () => {
      const gameState = {
        ...initialGameState,
        location: {
          type: 'town',
          name: 'Boot Hill',
        } as LocationType,
      };

      const result = extractContextFromGameState(gameState);
      expect(result.locationType).toEqual({ type: 'town', name: 'Boot Hill' });
    });

    it('defaults to town if location not found', () => {
      const gameState = {
        ...initialGameState,
        location: null,
      };

      const result = extractContextFromGameState(gameState);
      expect(result.locationType).toEqual({ type: 'town', name: 'Unknown Town' });
    });

    it('extracts character names from NPCs', () => {
      const gameState = {
        ...initialGameState,
        npcs: ['Sheriff Johnson', 'Bartender Mike'],
      };

      const result = extractContextFromGameState(gameState);
      expect(result.characters).toContain('Sheriff Johnson');
      expect(result.characters).toContain('Bartender Mike');
    });
  });

  describe('findBestTemplateMatch', () => {
    const templates: DecisionTemplate[] = [
      {
        id: 'test-template-1',
        prompt: 'Test Prompt 1',
        importance: 'moderate',
        locationType: { type: 'town', name: 'Test Town' },
        characterRequirements: ['Sheriff'],
        options: [],
        contextDescription: 'Test context',
      },
      {
        id: 'test-template-2',
        prompt: 'Test Prompt 2',
        importance: 'significant',
        locationType: { type: 'town', name: 'Test Town' },
        themeRequirements: ['justice', 'revenge'],
        options: [],
        contextDescription: 'Test context',
      },
      {
        id: 'test-template-3',
        prompt: 'Test Prompt 3',
        importance: 'minor',
        locationType: { type: 'town', name: 'Test Town' },
        options: [],
        contextDescription: 'Test context',
      },
    ];

    it('finds template with character match', () => {
      const characters = ['Sheriff', 'Deputy'];
      const themes = ['love'];

      const result = findBestTemplateMatch(templates, characters, themes);
      expect(result?.id).toBe('test-template-1');
    });

    it('finds template with theme match', () => {
      const characters = ['Bartender'];
      const themes = ['justice', 'honor'];

      const result = findBestTemplateMatch(templates, characters, themes);
      expect(result?.id).toBe('test-template-2');
    });

    it('returns random template if no good matches', () => {
      const characters = ['Random Character'];
      const themes = ['random'];

      // We can't test randomness directly, but we can verify it returns something
      const result = findBestTemplateMatch(templates, characters, themes);
      expect(result).not.toBeNull();
    });
  });

  describe('templateToDecision', () => {
    it('converts template to decision', () => {
      const template: DecisionTemplate = {
        id: 'test-template',
        prompt: 'Test Prompt',
        importance: 'significant',
        locationType: { type: 'town', name: 'Test Town' },
        options: [
          {
            id: 'option1',
            text: 'Option 1',
            impact: 'Impact 1',
            tags: ['tag1']
          }
        ],
        contextDescription: 'Test context'
      };

      const context = {
        characterFocus: ['Sheriff']
      };

      const result = templateToDecision(template, context);

      expect(result.prompt).toBe('Test Prompt');
      expect(result.importance).toBe('significant');
      expect(result.options.length).toBe(1);
      expect(result.options[0].id).toBe('option1');
      expect(result.characters).toEqual(['Sheriff']);
      expect(result.aiGenerated).toBe(false);
    });
  });

  describe('generateContextualDecision', () => {
    // Mock global console.error to suppress expected error messages in tests
    const originalConsoleError = console.error;
    beforeAll(() => {
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('generates contextual decision based on game state', () => {
      const gameState = {
        ...initialGameState,
        location: {
          type: 'town',
          name: 'Boot Hill',
        } as LocationType,
        npcs: ['Sheriff'],
        narrative: {
          currentStoryPoint: null,
          visitedPoints: [],
          availableChoices: [],
          narrativeHistory: [],
          displayMode: 'standard' as NarrativeDisplayMode,
          narrativeContext: {
            themes: [],
            characterFocus: [],
            worldContext: 'Test World Context',
            importantEvents: [],
            storyPoints: {} as Record<string, StoryPoint>,
            narrativeArcs: {} as Record<string, NarrativeArc>,
            impactState: {} as ImpactState,
            narrativeBranches: {} as Record<string, NarrativeBranch>,
            pendingDecisions: [],
            decisionHistory: []
          },
        },
      };

      const narrativeContext: NarrativeContext = {
        characterFocus: ['Sheriff'],
        themes: ['justice'],
        worldContext: 'Test World Context',
        importantEvents: [],
        storyPoints: {} as Record<string, StoryPoint>,
        narrativeArcs: {} as Record<string, NarrativeArc>,
        impactState: {} as ImpactState,
        narrativeBranches: {} as Record<string, NarrativeBranch>,
        pendingDecisions: [],
        decisionHistory: []
      };

      const result = generateContextualDecision(gameState, narrativeContext);

      expect(result).not.toBeNull();
      expect(result?.location?.type ?? 'unknown').toBe('town');
      // We can't test exact contents since template selection has randomness
    });

    it('returns null when no templates are available', () => {
      const gameState = {
        ...initialGameState,
        location: {
          type: 'unknown',
          name: 'Nowhere'
        } as LocationType
      };

      const result = generateContextualDecision(gameState);
      expect(result).toBeNull();
    });

    it('uses forced location type when provided', () => {
      const gameState = {
        ...initialGameState,
        location: {
          type: 'town',
          name: 'Boot Hill'
        } as LocationType,
      };

      const result = generateContextualDecision(gameState, undefined, { type: 'wilderness', description: 'Some wilderness' });

      expect(result).not.toBeNull();
      expect(result?.location?.type ?? 'unknown').toBe('wilderness');
    });
  });
});