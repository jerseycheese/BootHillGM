import { parsePlayerDecision, parseAIResponse } from '../../../services/ai/responseParser';
import { isValidPlayerDecision  } from 'app/services/ai/parsers/playerDecisionParser';
import { PlayerDecision } from '../../../types/narrative.types';
import { AIResponse } from '../../../services/ai/types';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('responseParser', () => {
  beforeEach(() => {
    (uuidv4 as jest.Mock).mockImplementation(() => 'mocked-uuid');
  });

  test('should clean metadata markers from combat text', () => {
    const input = `
Combat
Attack
Player Health: 67
Opponent Health: 100
Dusty McTrigger ACQUIRED_ITEMS: REMOVED_ITEMS: misses Shopkeeper! (Roll: 73, Target: 61)
Shopkeeper ACQUIRED_ITEMS: REMOVED_ITEMS: hits Dusty McTrigger for 5 damage! (Roll: 60, Target: 62)
    `;

    const result = parseAIResponse(input) as AIResponse;

    expect(result.narrative).toContain('Dusty McTrigger misses Shopkeeper!');
    expect(result.narrative).toContain('Shopkeeper hits Dusty McTrigger for 5 damage!');
    expect(result.narrative).not.toContain('ACQUIRED_ITEMS:');
    expect(result.narrative).not.toContain('REMOVED_ITEMS:');
  });

  test('should handle combat text with inventory changes', () => {
    const input = `
Combat ensues!
ACQUIRED_ITEMS: [Gun, Bullets]
REMOVED_ITEMS: [Money]
Player attacks bandit ACQUIRED_ITEMS: REMOVED_ITEMS: and hits! (Roll: 45, Target: 50)
    `;

    const result = parseAIResponse(input) as AIResponse;

    expect(result.narrative).toContain('Combat ensues!');
    expect(result.narrative).toContain('Player attacks bandit and hits!');
    expect(result.narrative).not.toContain('ACQUIRED_ITEMS:');
    expect(result.narrative).not.toContain('REMOVED_ITEMS:');
    expect(result.acquiredItems).toEqual(['Gun', 'Bullets']);
    expect(result.removedItems).toEqual(['Money']);
  });

  test('should handle combat initiation with opponent name', () => {
    const input = `
A menacing figure appears!
COMBAT: Angry Bandit ACQUIRED_ITEMS: REMOVED_ITEMS:
The bandit draws his gun!
    `;

    const result = parseAIResponse(input) as AIResponse;

    expect(result.narrative).toContain('A menacing figure appears!');
    expect(result.narrative).toContain('The bandit draws his gun!');
    expect(result.opponent?.name).toBe('Angry Bandit');
    expect(result.narrative).not.toContain('ACQUIRED_ITEMS:');
    expect(result.narrative).not.toContain('REMOVED_ITEMS:');
  });

  test('should preserve combat roll information', () => {
    const input = `
Combat round:
Player ACQUIRED_ITEMS: REMOVED_ITEMS: attacks with (Roll: 75, Target: 70)
    `;

    const result = parseAIResponse(input) as AIResponse;

    expect(result.narrative).toContain('Combat round:');
    expect(result.narrative).toContain('Player attacks with (Roll: 75, Target: 70)');
    expect(result.narrative).not.toContain('ACQUIRED_ITEMS:');
    expect(result.narrative).not.toContain('REMOVED_ITEMS:');
  });

  test('should handle multiline metadata blocks after character names', () => {
    const input = `Prospector

ACQUIRED_ITEMS: []
REMOVED_ITEMS: []
SUGGESTED_ACTIONS: [{"title": "Throw a punch", "type": "combat", "description": "Attack the prospector", "id": "punch-1"}, {"title": "Search the prospector's pockets", "type": "interaction", "description": "Attempt to rob the prospector", "id": "search-1"}, {"title": "Run back into the saloon", "type": "basic", "description": "Escape the fight", "id": "escape-1"}] punches with Miss (Roll: 2) dealing 0 damage to head`;

    const result = parseAIResponse(input) as AIResponse;
    
    expect(result.narrative).toBe('Prospector punches with Miss (Roll: 2) dealing 0 damage to head');
    expect(result.narrative).not.toContain('ACQUIRED_ITEMS:');
    expect(result.narrative).not.toContain('REMOVED_ITEMS:');
    expect(result.narrative).not.toContain('SUGGESTED_ACTIONS:');
    
    // Use type checking to ensure suggestedActions exists and is an array
    if (result.suggestedActions && Array.isArray(result.suggestedActions)) {
      expect(result.suggestedActions.length).toBe(3);
      expect(result.suggestedActions[0].title).toBe('Throw a punch');
    }
  });

  describe('parsePlayerDecision', () => {
    it('should correctly parse a valid player decision', () => {
      const decisionData = {
        prompt: 'Test Prompt',
        options: [
          { text: 'Option 1', impact: 'Impact 1', tags: ['tag1'] },
          { text: 'Option 2', impact: 'Impact 2' },
        ],
        importance: 'moderate',
        context: 'Test Context',
        characters: ['char1', 'char2'],
      };
      const expected: PlayerDecision = {
        id: 'mocked-uuid',
        prompt: 'Test Prompt',
        timestamp: expect.any(Number),
        location: undefined,
        options: [
          { id: 'mocked-uuid', text: 'Option 1', impact: 'Impact 1', tags: ['tag1'] },
          { id: 'mocked-uuid', text: 'Option 2', impact: 'Impact 2', tags: [] },
        ],
        context: 'Test Context',
        importance: 'moderate',
        characters: ['char1', 'char2'],
        aiGenerated: true,
      };

      const result = parsePlayerDecision(decisionData);
      expect(result).toEqual(expected);
    });

    it('should return undefined for invalid decision data', () => {
      const invalidData = { /* Intentionally empty */ };
      expect(parsePlayerDecision(invalidData)).toBeUndefined();
    });

    it('should return undefined if less than 2 options are valid', () => {
      const decisionData = {
        prompt: 'Test Prompt',
        options: [
          { text: 'Option 1', impact: 'Impact 1' },
          { text: '', impact: '' }
        ],
        importance: 'moderate'
      }
      expect(parsePlayerDecision(decisionData)).toBeUndefined();
    });
    
    it('should return undefined if options is not an array', () => {
      const decisionData = {
        prompt: 'Test Prompt',
        options: [],
        importance: 'moderate'
      };
      expect(parsePlayerDecision(decisionData)).toBeUndefined();
    });

    it('should default importance to moderate if invalid', () => {
      const decisionData = {
        prompt: 'Test Prompt',
        options: [
          { text: 'Option 1', impact: 'Impact 1' },
          { text: 'Option 2', impact: 'Impact 2' },
        ],
        importance: 'invalid',
      };
      const result = parsePlayerDecision(decisionData);
      expect(result?.importance).toBe('moderate');
    });
  });

  describe('isValidPlayerDecision', () => {
    it('should return true for a valid player decision', () => {
      const validDecision = {
        prompt: 'Test Prompt',
        options: [
          { text: 'Option 1', impact: 'Impact 1' },
          { text: 'Option 2', impact: 'Impact 2' },
        ],
      };
      expect(isValidPlayerDecision(validDecision)).toBe(true);
    });

    it('should return false for an invalid player decision', () => {
      const invalidDecision = { /* Intentionally empty */ };
      expect(isValidPlayerDecision(invalidDecision)).toBe(false);
    });
    
    it('should return false if options is missing', () => {
      const invalidDecision = {
        prompt: 'Test Prompt'
      };
      expect(isValidPlayerDecision(invalidDecision)).toBe(false);
    });
  });

  describe('parseAIResponse with playerDecision', () => {
    it('should extract playerDecision from JSON response', () => {
      const input = `{
        "narrative": "Test narrative",
        "location": { "type": "town", "name": "Test Town" },
        "combatInitiated": false,
        "acquiredItems": [],
        "removedItems": [],
        "suggestedActions": [],
        "playerDecision": {
          "prompt": "What will you do?",
          "options": [
            { "text": "Option 1", "impact": "Impact 1", "tags": ["tag1"] },
            { "text": "Option 2", "impact": "Impact 2" }
          ],
          "importance": "significant",
          "context": "Decision context",
          "characters": ["Character 1"]
        }
      }`;

      const result = parseAIResponse(input) as AIResponse;
      
      expect(result.playerDecision).toBeDefined();
      expect(result.playerDecision?.prompt).toBe("What will you do?");
      expect(result.playerDecision?.options).toHaveLength(2);
      expect(result.playerDecision?.importance).toBe("significant");
      expect(result.playerDecision?.context).toBe("Decision context");
      expect(result.playerDecision?.characters).toEqual(["Character 1"]);
    });

    it('should handle missing playerDecision in JSON response', () => {
      const input = `{
        "narrative": "Test narrative",
        "location": { "type": "town", "name": "Test Town" },
        "combatInitiated": false,
        "acquiredItems": [],
        "removedItems": [],
        "suggestedActions": []
      }`;

      const result = parseAIResponse(input) as AIResponse;
      
      expect(result.playerDecision).toBeUndefined();
    });

    it('should handle invalid playerDecision in JSON response', () => {
      const input = `{
        "narrative": "Test narrative",
        "location": { "type": "town", "name": "Test Town" },
        "combatInitiated": false,
        "acquiredItems": [],
        "removedItems": [],
        "suggestedActions": [],
        "playerDecision": {
          "prompt": "What will you do?",
          "options": [
            { "text": "Option 1", "impact": "Impact 1" }
          ]
        }
      }`;

      const result = parseAIResponse(input) as AIResponse;
      
      // Should be undefined because there's only one valid option
      expect(result.playerDecision).toBeUndefined();
    });
  });
});