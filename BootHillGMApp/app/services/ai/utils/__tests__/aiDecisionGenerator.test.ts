/**
 * Unit tests for the AI Decision Generator
 * 
 * These tests verify that the decision generator properly handles
 * context extraction and prevents stale context issues.
 */

import { 
  buildDecisionPrompt, 
  aiResponseToPlayerDecision, 
  generateFallbackDecision 
} from '../aiDecisionGenerator';
import { NarrativeState } from '../../../../types/narrative.types';
import { Character } from '../../../../types/character';
import { DecisionHistoryEntry } from '../../types/aiDecisionTypes';

describe('AI Decision Generator', () => {
  // Test data for consistent testing
  const createCharacter = (overrides = {}): Character => ({
    id: 'test-char-1',
    name: 'Test Character',
    isNPC: false,
    attributes: {
      bravery: 7,
      speed: 8,
      gunAccuracy: 9,
      luck: 5,
      strength: 6,
    },
    personality: {
      dominant: ['resourceful', 'determined']
    },
    relationships: {
      'Sheriff Jones': 'ally',
      'Bandit Bill': 'enemy'
    },
    ...overrides
  });

  const createNarrativeState = (entries: string[] = []): NarrativeState => ({
    narrativeHistory: entries,
    currentStoryPoint: entries.length > 0 ? {
      id: 'current-point',
      content: entries[entries.length - 1],
      locationChange: 'Saloon'
    } : undefined
  });

  const createDecisionHistory = (): DecisionHistoryEntry[] => [
    {
      prompt: 'How do you respond to the Sheriff?',
      choice: 'Offer to help',
      outcome: 'The Sheriff thanks you for your offer.',
      timestamp: Date.now() - 2000
    },
    {
      prompt: 'What do you say to the bartender?',
      choice: 'Ask for information',
      outcome: 'The bartender leans in and whispers some useful details.',
      timestamp: Date.now() - 1000
    }
  ];

  describe('buildDecisionPrompt', () => {
    test('should include the current narrative context', () => {
      // Arrange
      const narrativeState = createNarrativeState([
        'You entered the town of Dusty Gulch.',
        'You met Sheriff Jones at the jailhouse.',
        'You are now at the Saloon, and Bandit Bill just walked in.'
      ]);
      const character = createCharacter();
      const decisionsHistory = createDecisionHistory();

      // Act
      const prompt = buildDecisionPrompt(narrativeState, character, decisionsHistory);

      // Assert
      expect(prompt.narrativeContext).toContain('Bandit Bill just walked in');
      expect(prompt.gameState.location).toBe('Saloon');
      expect(prompt.characterInfo.traits).toContain('quick');
      expect(prompt.characterInfo.traits).toContain('sharpshooter');
    });

    test('should extract comprehensive narrative context with chronological ordering', () => {
      // Arrange
      const narrativeState = createNarrativeState([
        'You entered the town of Dusty Gulch.',
        'You met Sheriff Jones at the jailhouse.',
        'You walked to the general store to buy supplies.',
        'You headed to the Saloon for a drink.',
        'Bandit Bill just walked into the Saloon.'
      ]);
      const character = createCharacter();
      const decisionsHistory = createDecisionHistory();

      // Act
      const prompt = buildDecisionPrompt(narrativeState, character, decisionsHistory);

      // Assert
      expect(prompt.narrativeContext).toContain('Current situation: Bandit Bill just walked into the Saloon');
      expect(prompt.narrativeContext).toContain('Recent Event 1');
      expect(prompt.narrativeContext).toContain('You entered the town');
      expect(prompt.narrativeContext).toContain('You met Sheriff Jones');
      expect(prompt.gameState.recentEvents).toHaveLength(5);
    });

    test('should update context when narrative state changes', () => {
      // Arrange
      const initialState = createNarrativeState([
        'You entered the town of Dusty Gulch.',
        'You are at the Saloon.'
      ]);
      const character = createCharacter();
      const decisionsHistory = createDecisionHistory();

      // First context generation
      const firstPrompt = buildDecisionPrompt(initialState, character, decisionsHistory);

      // Update the narrative state
      const updatedState = createNarrativeState([
        ...initialState.narrativeHistory,
        'Bandit Bill entered the Saloon.',
        'Sheriff Jones followed shortly after, hand on his pistol.'
      ]);

      // Second context generation with updated state
      const secondPrompt = buildDecisionPrompt(updatedState, character, decisionsHistory);

      // Assert
      expect(secondPrompt.narrativeContext).not.toBe(firstPrompt.narrativeContext);
      expect(secondPrompt.narrativeContext).toContain('Sheriff Jones followed shortly after');
      expect(secondPrompt.gameState.recentEvents).toContain('Sheriff Jones followed shortly after');
    });

    test('should infer location when not explicitly provided', () => {
      // Arrange
      const narrativeState: NarrativeState = {
        narrativeHistory: [
          'You rode into town.',
          'You arrived at the General Store.',
          'You purchased supplies for your journey.'
        ],
        currentStoryPoint: {
          id: 'current-point',
          content: 'You are browsing the merchandise.',
          // No locationChange provided
        }
      };
      const character = createCharacter();
      const decisionsHistory = createDecisionHistory();

      // Act
      const prompt = buildDecisionPrompt(narrativeState, character, decisionsHistory);

      // Assert
      expect(prompt.gameState.location).toBe('General Store');
    });

    test('should include previous decisions in the context', () => {
      // Arrange
      const narrativeState = createNarrativeState([
        'You entered the town of Dusty Gulch.',
        'You met Sheriff Jones at the jailhouse.',
        'You offered to help the Sheriff with his bandit problem.',
      ]);
      const character = createCharacter();
      const decisionsHistory = createDecisionHistory();

      // Act
      const prompt = buildDecisionPrompt(narrativeState, character, decisionsHistory);

      // Assert
      expect(prompt.previousDecisions).toHaveLength(2);
      expect(prompt.previousDecisions[0].prompt).toBe('How do you respond to the Sheriff?');
      expect(prompt.previousDecisions[0].choice).toBe('Offer to help');
      expect(prompt.previousDecisions[1].prompt).toBe('What do you say to the bartender?');
    });

    test('should extract relationships from character and narrative', () => {
      // Arrange
      const narrativeState = createNarrativeState([
        'You entered the town of Dusty Gulch.',
        'You met Sally at the general store. She helped you find supplies.',
        'You are now at the Saloon, and Bandit Bill just walked in.'
      ]);
      const character = createCharacter();
      const decisionsHistory = createDecisionHistory();

      // Act
      const prompt = buildDecisionPrompt(narrativeState, character, decisionsHistory);

      // Assert
      expect(prompt.characterInfo.relationships['Sheriff Jones']).toBe('ally');
      expect(prompt.characterInfo.relationships['Bandit Bill']).toBe('enemy');
      expect(prompt.characterInfo.relationships['Sally']).toBe('ally'); // Inferred from "helped you"
    });

    test('should handle empty narrative history gracefully', () => {
      // Arrange
      const emptyState: NarrativeState = {
        narrativeHistory: [],
        currentStoryPoint: undefined
      };
      const character = createCharacter();
      const decisionsHistory = createDecisionHistory();

      // Act
      const prompt = buildDecisionPrompt(emptyState, character, decisionsHistory);

      // Assert
      expect(prompt.narrativeContext).toBe('');
      expect(prompt.gameState.location).toBe('Unknown');
      expect(prompt.gameState.recentEvents).toEqual([]);
      expect(prompt.previousDecisions).toHaveLength(2); // Still includes decisions
    });

    test('should prevent mutation of the original narrative state', () => {
      // Arrange
      const narrativeState = createNarrativeState([
        'You entered the town of Dusty Gulch.',
        'You met Sheriff Jones at the jailhouse.',
      ]);
      const originalHistoryLength = narrativeState.narrativeHistory.length;
      const character = createCharacter();
      const decisionsHistory = createDecisionHistory();

      // Act
      buildDecisionPrompt(narrativeState, character, decisionsHistory);
      
      // Try to mutate the state that was passed to the function
      narrativeState.narrativeHistory.push('This should not affect already created prompts');
      
      // Assert - the original state should remain unchanged during prompt creation
      expect(narrativeState.narrativeHistory.length).toBe(originalHistoryLength + 1);
      
      // Create another prompt with the modified state
      const newPrompt = buildDecisionPrompt(narrativeState, character, decisionsHistory);
      
      // This new prompt should include the newly added item
      expect(newPrompt.narrativeContext).toContain('This should not affect already created prompts');
    });
  });

  describe('aiResponseToPlayerDecision', () => {
    test('should convert AI response to player decision format', () => {
      // Arrange
      const aiResponse = {
        decisionId: 'test-decision-1',
        prompt: 'What do you do next?',
        options: [
          { 
            id: 'opt1', 
            text: 'Confront Bandit Bill', 
            impact: 'Could lead to a confrontation',
            traits: ['brave', 'direct'],
            confidence: 0.8
          },
          { 
            id: 'opt2', 
            text: 'Wait and observe', 
            impact: 'Might gain more information',
            traits: ['cautious', 'patient'],
            confidence: 0.7
          }
        ],
        metadata: {
          importance: 'major'
        }
      };
      const config = {
        minDecisionInterval: 30000,
        relevanceThreshold: 0.6,
        maxOptionsPerDecision: 4,
        apiConfig: {
          apiKey: 'test-key',
          endpoint: 'test-endpoint',
          modelName: 'test-model',
          maxRetries: 3,
          timeout: 10000,
          rateLimit: 10
        }
      };

      // Act
      const playerDecision = aiResponseToPlayerDecision(aiResponse, config, 'Saloon');

      // Assert
      expect(playerDecision.id).toBe('test-decision-1');
      expect(playerDecision.prompt).toBe('What do you do next?');
      expect(playerDecision.options).toHaveLength(2);
      expect(playerDecision.options[0].text).toBe('Confront Bandit Bill');
      expect(playerDecision.options[0].tags).toEqual(['brave', 'direct']);
      expect(playerDecision.importance).toBe('major');
      expect(playerDecision.location).toBe('Saloon');
      expect(playerDecision.aiGenerated).toBe(true);
    });

    test('should add fallback options if fewer than 2 options provided', () => {
      // Arrange
      const aiResponse = {
        decisionId: 'test-decision-1',
        prompt: 'What do you do next?',
        options: [
          { 
            id: 'opt1', 
            text: 'Confront Bandit Bill', 
            impact: 'Could lead to a confrontation',
            traits: ['brave', 'direct'],
            confidence: 0.8
          }
        ],
        metadata: {
          importance: 'major'
        }
      };
      const config = {
        minDecisionInterval: 30000,
        relevanceThreshold: 0.6,
        maxOptionsPerDecision: 4,
        apiConfig: {
          apiKey: 'test-key',
          endpoint: 'test-endpoint',
          modelName: 'test-model',
          maxRetries: 3,
          timeout: 10000,
          rateLimit: 10
        }
      };

      // Act
      const playerDecision = aiResponseToPlayerDecision(aiResponse, config, 'Saloon');

      // Assert
      expect(playerDecision.options).toHaveLength(2);
      expect(playerDecision.options[0].text).toBe('Confront Bandit Bill');
      expect(playerDecision.options[1].text).toBe('Take decisive action');
    });
  });

  describe('generateFallbackDecision', () => {
    test('should create a valid fallback decision when AI is unavailable', () => {
      // Arrange
      const narrativeState = createNarrativeState([
        'You entered the town of Dusty Gulch.',
        'You are at the Saloon.'
      ]);
      const character = createCharacter();

      // Act
      const fallbackDecision = generateFallbackDecision(narrativeState, character);

      // Assert
      expect(fallbackDecision.id).toContain('fallback-decision-');
      expect(fallbackDecision.prompt).toBe('How do you want to proceed?');
      expect(fallbackDecision.options).toHaveLength(3);
      expect(fallbackDecision.location).toBe('Saloon');
      expect(fallbackDecision.importance).toBe('moderate');
      expect(fallbackDecision.aiGenerated).toBe(true);
    });
  });
});
