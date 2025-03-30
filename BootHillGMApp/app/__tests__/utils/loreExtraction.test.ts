/**
 * Tests for lore extraction utilities
 */

import { extractLoreFromAIResponse, buildLoreExtractionPrompt } from '../../utils/loreExtraction';
import { initialLoreState } from '../../types/narrative/lore.types';
import { AIResponse } from '../../types/ai.types';

describe('loreExtraction', () => {
  describe('extractLoreFromAIResponse', () => {
    it('should extract lore data from AI response', async () => {
      // Arrange
      const mockResponse: AIResponse = {
        narrative: 'Test narrative',
        location: { type: 'town', name: 'Redemption' },
        combatInitiated: false,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: [],
        lore: {
          newFacts: [
            {
              category: 'location',
              content: 'Redemption has a population of about 500 people.',
              importance: 6,
              confidence: 7,
              tags: ['redemption', 'population']
            },
            {
              category: 'character',
              content: 'Sheriff Johnson has a deputy named Williams.',
              importance: 5,
              confidence: 8,
              tags: ['sheriff johnson', 'deputy williams']
            }
          ],
          updatedFacts: [
            {
              id: 'fact-1',
              content: 'Updated fact content',
              importance: 7,
              confidence: 6
            }
          ]
        }
      };

      // Act
      const result = await extractLoreFromAIResponse(
        mockResponse, 
        initialLoreState
      );

      // Assert
      expect(result.newFacts).toHaveLength(2);
      expect(result.updatedFacts).toHaveLength(1);
      
      // Check that categories are preserved
      expect(result.newFacts[0].category).toBe('location');
      expect(result.newFacts[1].category).toBe('character');
      
      // Check content
      expect(result.newFacts[0].content).toBe('Redemption has a population of about 500 people.');
      expect(result.newFacts[1].content).toBe('Sheriff Johnson has a deputy named Williams.');
      
      // Check importance and confidence
      expect(result.newFacts[0].importance).toBe(6);
      expect(result.newFacts[0].confidence).toBe(7);
      
      // Check updated fact
      expect(result.updatedFacts![0].id).toBe('fact-1');
      expect(result.updatedFacts![0].content).toBe('Updated fact content');
    });

    it('should provide default values for missing fields', async () => {
      // Arrange
      const mockResponse: AIResponse = {
        narrative: 'Test narrative',
        location: { type: 'town', name: 'Redemption' },
        combatInitiated: false,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: [],
        lore: {
          newFacts: [
            {
              // Missing category
              content: 'Minimal fact with defaults.',
            } as unknown as { category: string; content: string; }
          ]
        }
      };

      // Act
      const result = await extractLoreFromAIResponse(
        mockResponse, 
        initialLoreState
      );

      // Assert
      expect(result.newFacts).toHaveLength(1);
      expect(result.newFacts[0].category).toBe('concept'); // Default category
      expect(result.newFacts[0].importance).toBe(5); // Default importance
      expect(result.newFacts[0].confidence).toBe(5); // Default confidence
      expect(result.newFacts[0].tags).toEqual([]); // Default tags
    });

    it('should handle missing lore field in response', async () => {
      // Arrange
      const mockResponse: AIResponse = {
        narrative: 'Test narrative',
        location: { type: 'town', name: 'Redemption' },
        combatInitiated: false,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: []
        // No lore field
      };

      // Act
      const result = await extractLoreFromAIResponse(
        mockResponse, 
        initialLoreState
      );

      // Assert
      expect(result.newFacts).toHaveLength(0);
      expect(result.updatedFacts).toBeUndefined();
    });

    it('should validate lore categories', async () => {
      // Arrange
      const mockResponse: AIResponse = {
        narrative: 'Test narrative',
        location: { type: 'town', name: 'Redemption' },
        combatInitiated: false,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: [],
        lore: {
          newFacts: [
            {
              category: 'invalid-category' as unknown as string,
              content: 'This should get a default category',
              importance: 5,
              confidence: 5
            },
            {
              category: 'character',
              content: 'This should keep its category',
              importance: 5,
              confidence: 5
            }
          ]
        }
      };

      // Act
      const result = await extractLoreFromAIResponse(
        mockResponse, 
        initialLoreState
      );

      // Assert
      expect(result.newFacts[0].category).toBe('concept'); // Default for invalid
      expect(result.newFacts[1].category).toBe('character'); // Valid preserved
    });

    it('should handle malformed lore data gracefully', async () => {
      // Arrange
      // Create a malformed response with lore as a string instead of object
      const mockResponseBase = {
        narrative: 'Test narrative',
        location: { type: 'town', name: 'Redemption' },
        combatInitiated: false,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: []
      };
      
      // First cast to unknown, then to AIResponse to avoid type checking errors
      const mockResponse = {
        ...mockResponseBase,
        lore: 'not an object'
      } as unknown as AIResponse;

      // Act
      const result = await extractLoreFromAIResponse(
        mockResponse, 
        initialLoreState
      );

      // Assert
      expect(result.newFacts).toHaveLength(0);
    });

    it('should handle errors during extraction', async () => {
      // Arrange
      const mockResponse = null as unknown as AIResponse;

      // Act & Assert
      try {
        const result = await extractLoreFromAIResponse(
          mockResponse, 
          initialLoreState
        );
        
        // Should return empty result even on error
        expect(result.newFacts).toHaveLength(0);
      } catch (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _error) {
        // Test fails if extraction doesn't handle errors
        fail('extractLoreFromAIResponse should handle errors gracefully');
      }
    });
  });

  describe('buildLoreExtractionPrompt', () => {
    it('should return a string with lore extraction instructions', () => {
      // Act
      const result = buildLoreExtractionPrompt();

      // Assert
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(100);
      
      // Check for key elements
      expect(result).toContain('lore');
      expect(result).toContain('newFacts');
      expect(result).toContain('category');
      expect(result).toContain('content');
      expect(result).toContain('importance');
      expect(result).toContain('confidence');
      expect(result).toContain('tags');
      
      // Look for instructions
      expect(result).toContain('Guidelines for lore extraction');
    });
  });
});
