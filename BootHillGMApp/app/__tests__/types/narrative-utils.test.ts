/**
 * Tests for narrative type guards and utilities
 */

import { isStoryPoint, isNarrativeChoice } from '../../types/narrative/utils';
import { StoryPoint } from '../../types/narrative/story-point.types';
import { NarrativeChoice } from '../../types/narrative/choice.types';

describe('Narrative type guards', () => {
  describe('isStoryPoint', () => {
    it('should return true for valid StoryPoint objects', () => {
      const validStoryPoint: StoryPoint = {
        id: 'test-point-1',
        type: 'exposition',
        title: 'Test Story Point',
        content: 'This is a test story point.',
      };
      
      expect(isStoryPoint(validStoryPoint)).toBe(true);
    });
    
    it('should return true for StoryPoint objects with optional properties', () => {
      const storyPointWithOptionals: StoryPoint = {
        id: 'test-point-2',
        type: 'decision',
        title: 'Decision Point',
        content: 'Make a choice:',
        choices: [
          {
            id: 'choice-1',
            text: 'Option 1',
            leadsTo: 'result-1'
          }
        ],
        tags: ['important', 'character-development']
      };
      
      expect(isStoryPoint(storyPointWithOptionals)).toBe(true);
    });
    
    it('should return false for null or undefined', () => {
      expect(isStoryPoint(null)).toBe(false);
      expect(isStoryPoint(undefined)).toBe(false);
    });
    
    it('should return false for non-object values', () => {
      expect(isStoryPoint('not an object')).toBe(false);
      expect(isStoryPoint(42)).toBe(false);
      expect(isStoryPoint(true)).toBe(false);
    });
    
    it('should return false for objects missing required properties', () => {
      // Missing id
      expect(isStoryPoint({
        type: 'exposition',
        title: 'Missing ID',
        content: 'Content here'
      })).toBe(false);
      
      // Missing type
      expect(isStoryPoint({
        id: 'missing-type',
        title: 'Missing Type',
        content: 'Content here'
      })).toBe(false);
      
      // Missing title
      expect(isStoryPoint({
        id: 'missing-title',
        type: 'exposition',
        content: 'Content here'
      })).toBe(false);
      
      // Missing content
      expect(isStoryPoint({
        id: 'missing-content',
        type: 'exposition',
        title: 'Missing Content'
      })).toBe(false);
    });
    
    it('should return false for objects with wrong property types', () => {
      // ID is not a string
      expect(isStoryPoint({
        id: 123,
        type: 'exposition',
        title: 'Wrong ID Type',
        content: 'Content here'
      })).toBe(false);
      
      // Type is not a string
      expect(isStoryPoint({
        id: 'wrong-type',
        type: true,
        title: 'Wrong Type Type',
        content: 'Content here'
      })).toBe(false);
    });
  });
  
  describe('isNarrativeChoice', () => {
    it('should return true for valid NarrativeChoice objects', () => {
      const validChoice: NarrativeChoice = {
        id: 'choice-1',
        text: 'Choose this option',
        leadsTo: 'destination-1'
      };
      
      expect(isNarrativeChoice(validChoice)).toBe(true);
    });
    
    it('should return true for NarrativeChoice objects with optional properties', () => {
      const choiceWithOptionals: NarrativeChoice = {
        id: 'choice-2',
        text: 'Option with consequences',
        leadsTo: 'destination-2',
        consequence: 'Something bad happens',
        requiresItem: 'magic-key'
      };
      
      expect(isNarrativeChoice(choiceWithOptionals)).toBe(true);
    });
    
    it('should return false for null or undefined', () => {
      expect(isNarrativeChoice(null)).toBe(false);
      expect(isNarrativeChoice(undefined)).toBe(false);
    });
    
    it('should return false for non-object values', () => {
      expect(isNarrativeChoice('not an object')).toBe(false);
      expect(isNarrativeChoice(42)).toBe(false);
      expect(isNarrativeChoice([])).toBe(false);
    });
    
    it('should return false for objects missing required properties', () => {
      // Missing id
      expect(isNarrativeChoice({
        text: 'Missing ID',
        leadsTo: 'somewhere'
      })).toBe(false);
      
      // Missing text
      expect(isNarrativeChoice({
        id: 'missing-text',
        leadsTo: 'somewhere'
      })).toBe(false);
      
      // Missing leadsTo
      expect(isNarrativeChoice({
        id: 'missing-leads-to',
        text: 'No destination'
      })).toBe(false);
    });
    
    it('should return false for objects with wrong property types', () => {
      // ID is not a string
      expect(isNarrativeChoice({
        id: 123,
        text: 'Wrong ID Type',
        leadsTo: 'somewhere'
      })).toBe(false);
      
      // Text is not a string
      expect(isNarrativeChoice({
        id: 'wrong-text',
        text: true,
        leadsTo: 'somewhere'
      })).toBe(false);
      
      // LeadsTo is not a string
      expect(isNarrativeChoice({
        id: 'wrong-leads-to',
        text: 'Wrong destination type',
        leadsTo: 42
      })).toBe(false);
    });
    
    it('should handle malformed objects', () => {
      // Empty object
      expect(isNarrativeChoice({})).toBe(false);
      
      // Object with extra properties but missing required ones
      expect(isNarrativeChoice({
        consequence: 'No required properties',
        requiresItem: 'item'
      })).toBe(false);
    });
  });
});
