/**
 * Tests for AI Prompt Utilities
 */

import { describe, it, expect } from '@jest/globals';
import { 
  formatPromptForAPI, 
  processResponse, 
  validateDecision 
} from '../../utils/prompt-utils';
import { DecisionPrompt } from '../../types/ai-service.types';

describe('AI Prompt Utilities', () => {
  describe('formatPromptForAPI', () => {
    it('should format decision prompt correctly for API', () => {
      // Create a sample decision prompt
      const prompt: DecisionPrompt = {
        narrativeContext: 'You are in a saloon. The sheriff is watching you.',
        characterInfo: {
          traits: ['brave', 'quick'],
          history: 'Player Character',
          relationships: { 'Sheriff': 'neutral' }
        },
        gameState: {
          location: 'SALOON',
          currentScene: 'saloon-entrance',
          recentEvents: ['Entered town', 'Met the bartender']
        },
        previousDecisions: [
          {
            prompt: 'How do you enter town?',
            choice: 'Ride in slowly',
            outcome: 'You attracted little attention'
          }
        ]
      };
      
      // Format the prompt
      const formattedPrompt = formatPromptForAPI(prompt);
      
      // Validate structure
      expect(formattedPrompt).toHaveProperty('messages');
      expect(formattedPrompt.messages).toHaveLength(2);
      expect(formattedPrompt.messages[0].role).toBe('system');
      expect(formattedPrompt.messages[1].role).toBe('user');
      
      // Check content
      const userContent = formattedPrompt.messages[1].content;
      expect(userContent).toContain('NARRATIVE CONTEXT');
      expect(userContent).toContain('You are in a saloon.');
      expect(userContent).toContain('CHARACTER INFORMATION');
      expect(userContent).toContain('brave, quick');
      expect(userContent).toContain('GAME STATE');
      expect(userContent).toContain('SALOON');
      expect(userContent).toContain('PREVIOUS DECISIONS');
      expect(userContent).toContain('How do you enter town?');
    });
  });
  
  describe('processResponse', () => {
    it('should process API response with choices format', () => {
      const apiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                decisionId: 'test-decision',
                prompt: 'What do you do?',
                options: [
                  {
                    id: 'option-1',
                    text: 'Fight',
                    confidence: 0.8,
                    traits: ['brave'],
                    potentialOutcomes: ['Might win', 'Might lose'],
                    impact: 'Direct confrontation'
                  }
                ],
                relevanceScore: 0.9,
                metadata: {
                  narrativeImpact: 'High',
                  themeAlignment: 'Western showdown',
                  pacing: 'fast',
                  importance: 'critical'
                }
              })
            }
          }
        ]
      };
      
      const processed = processResponse(apiResponse);
      
      expect(processed.decisionId).toBe('test-decision');
      expect(processed.prompt).toBe('What do you do?');
      expect(processed.options).toHaveLength(1);
      expect(processed.options[0].id).toBe('option-1');
      expect(processed.options[0].text).toBe('Fight');
      expect(processed.relevanceScore).toBe(0.9);
      expect(processed.metadata.importance).toBe('critical');
    });
    
    it('should process API response with direct decision format', () => {
      const apiResponse = {
        decision: {
          decisionId: 'test-decision',
          prompt: 'What do you do?',
          options: [
            {
              id: 'option-1',
              text: 'Fight',
              confidence: 0.8,
              traits: ['brave'],
              potentialOutcomes: ['Might win', 'Might lose'],
              impact: 'Direct confrontation'
            }
          ],
          relevanceScore: 0.9,
          metadata: {
            narrativeImpact: 'High',
            themeAlignment: 'Western showdown',
            pacing: 'fast',
            importance: 'critical'
          }
        }
      };
      
      const processed = processResponse(apiResponse);
      
      expect(processed.decisionId).toBe('test-decision');
      expect(processed.options).toHaveLength(1);
    });
    
    it('should handle invalid response format', () => {
      const invalidResponse = { 
        something: 'unexpected'
      };
      
      expect(() => processResponse(invalidResponse)).toThrow('Unexpected API response format');
    });
  });
  
  describe('validateDecision', () => {
    it('should validate and enhance options', () => {
      const incompleteDecision = {
        decisionId: 'test-decision',
        prompt: 'What do you do?',
        options: [], // Empty options
        relevanceScore: 0.9,
        metadata: {
          narrativeImpact: 'High',
          themeAlignment: 'Western showdown',
          pacing: 'fast' as const,
          importance: 'critical' as const
        }
      };
      
      const validated = validateDecision(incompleteDecision);
      
      // Should add fallback options
      expect(validated.options.length).toBe(2);
      expect(validated.options[0].text).toContain('cautious');
      expect(validated.options[1].text).toContain('decisive');
    });
    
    it('should limit options to specified maximum', () => {
      const manyOptionsDecision = {
        decisionId: 'test-decision',
        prompt: 'What do you do?',
        options: [
          {
            id: 'option-1',
            text: 'Option 1',
            confidence: 0.9,
            traits: [],
            potentialOutcomes: [],
            impact: ''
          },
          {
            id: 'option-2',
            text: 'Option 2',
            confidence: 0.8,
            traits: [],
            potentialOutcomes: [],
            impact: ''
          },
          {
            id: 'option-3',
            text: 'Option 3',
            confidence: 0.7,
            traits: [],
            potentialOutcomes: [],
            impact: ''
          }
        ],
        relevanceScore: 0.9,
        metadata: {
          narrativeImpact: 'High',
          themeAlignment: 'Western showdown',
          pacing: 'fast' as const,
          importance: 'critical' as const
        }
      };
      
      const validated = validateDecision(manyOptionsDecision, 2);
      
      // Should limit to 2 options
      expect(validated.options.length).toBe(2);
      expect(validated.options[0].id).toBe('option-1'); // Highest confidence
      expect(validated.options[1].id).toBe('option-2'); // Second highest
    });
  });
});
