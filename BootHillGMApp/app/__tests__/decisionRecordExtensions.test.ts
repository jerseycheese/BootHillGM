import {
  PlayerDecision,
  PlayerDecisionOption,
  PlayerDecisionRecord,
  PlayerDecisionRecordWithImpact
} from '../types/narrative.types';
import {
  createDecisionRecordWithImpact,
  hasImpactMetadata,
  calculateTotalImpact,
  getMostSignificantImpacts
} from '../utils/decisionRecordExtensions';

// Mock uuid to ensure consistent IDs in tests
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

describe('Decision Record Extensions', () => {
  // Sample data for testing
  const mockDecisionOption: PlayerDecisionOption = {
    id: 'option-1',
    text: 'Help the sheriff',
    impact: 'Improve your reputation in town and relationship with the sheriff',
    tags: ['lawful', 'helpful']
  };

  const mockDecision: PlayerDecision = {
    id: 'decision-1',
    prompt: 'Will you help the sheriff catch the outlaws?',
    timestamp: Date.now(),
    options: [mockDecisionOption],
    context: 'The sheriff needs help catching dangerous outlaws',
    importance: 'significant',
    characters: ['Sheriff Johnson'],
    location: { type: 'town', name: 'Dusty Gulch' },
    aiGenerated: true
  };

  describe('createDecisionRecordWithImpact', () => {
    it('should create a decision record with impact metadata', () => {
      const result = createDecisionRecordWithImpact(
        mockDecision,
        'option-1',
        'You decided to help the sheriff, earning his trust.'
      );
      
      // Verify the record has the expected properties
      expect(result).toHaveProperty('decisionId', 'decision-1');
      expect(result).toHaveProperty('selectedOptionId', 'option-1');
      expect(result).toHaveProperty('impacts');
      expect(result).toHaveProperty('processedForImpact', false);
      expect(result).toHaveProperty('lastImpactUpdate');
      
      // Verify the impacts array contains the expected impacts
      expect(result.impacts.length).toBeGreaterThan(0);
      
      // Verify that the record has all the standard decision record properties
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('narrative');
      expect(result).toHaveProperty('impactDescription');
      expect(result).toHaveProperty('tags');
      expect(result).toHaveProperty('relevanceScore');
    });
  });

  describe('hasImpactMetadata', () => {
    it('should return true for records with impact metadata', () => {
      const recordWithImpact = createDecisionRecordWithImpact(
        mockDecision,
        'option-1',
        'You decided to help the sheriff, earning his trust.'
      );
      
      expect(hasImpactMetadata(recordWithImpact)).toBe(true);
    });
    
    it('should return false for records without impact metadata', () => {
      // Create a standard decision record without impact metadata
      const standardRecord: PlayerDecisionRecord = {
        decisionId: 'decision-1',
        selectedOptionId: 'option-1',
        timestamp: Date.now(),
        narrative: 'You decided to help the sheriff, earning his trust.',
        impactDescription: 'Improve your reputation in town',
        tags: ['lawful'],
        relevanceScore: 5
      };
      
      expect(hasImpactMetadata(standardRecord)).toBe(false);
    });
  });

  describe('calculateTotalImpact', () => {
    it('should calculate the total impact value for a specific type and target', () => {
      // Create multiple decision records with impacts
      const record1: PlayerDecisionRecordWithImpact = {
        decisionId: 'decision-1',
        selectedOptionId: 'option-1',
        timestamp: Date.now(),
        narrative: 'You helped the sheriff.',
        impactDescription: 'Improved reputation',
        tags: ['lawful'],
        relevanceScore: 5,
        impacts: [
          {
            id: 'impact-1',
            type: 'reputation',
            target: 'Dusty Gulch',
            severity: 'moderate',
            description: 'Improved reputation in town',
            value: 5
          }
        ],
        processedForImpact: true,
        lastImpactUpdate: Date.now()
      };
      
      const record2: PlayerDecisionRecordWithImpact = {
        decisionId: 'decision-2',
        selectedOptionId: 'option-1',
        timestamp: Date.now(),
        narrative: 'You helped the sheriff again.',
        impactDescription: 'Further improved reputation',
        tags: ['lawful'],
        relevanceScore: 5,
        impacts: [
          {
            id: 'impact-2',
            type: 'reputation',
            target: 'Dusty Gulch',
            severity: 'minor',
            description: 'Slightly improved reputation in town',
            value: 2
          }
        ],
        processedForImpact: true,
        lastImpactUpdate: Date.now()
      };
      
      const totalImpact = calculateTotalImpact(
        [record1, record2],
        'reputation',
        'Dusty Gulch'
      );
      
      // The total should be the sum of the impact values
      expect(totalImpact).toBe(7);
    });
    
    it('should return 0 if no matching impacts are found', () => {
      const record: PlayerDecisionRecordWithImpact = {
        decisionId: 'decision-1',
        selectedOptionId: 'option-1',
        timestamp: Date.now(),
        narrative: 'You helped the sheriff.',
        impactDescription: 'Improved reputation',
        tags: ['lawful'],
        relevanceScore: 5,
        impacts: [
          {
            id: 'impact-1',
            type: 'reputation',
            target: 'Dusty Gulch',
            severity: 'moderate',
            description: 'Improved reputation in town',
            value: 5
          }
        ],
        processedForImpact: true,
        lastImpactUpdate: Date.now()
      };
      
      const totalImpact = calculateTotalImpact(
        [record],
        'relationship', // Different type
        'Dusty Gulch'
      );
      
      expect(totalImpact).toBe(0);
    });
  });

  describe('getMostSignificantImpacts', () => {
    it('should return the most significant impacts based on absolute value', () => {
      // Create a record with multiple impacts of varying significance
      const record: PlayerDecisionRecordWithImpact = {
        decisionId: 'decision-1',
        selectedOptionId: 'option-1',
        timestamp: Date.now(),
        narrative: 'You made several impactful decisions.',
        impactDescription: 'Multiple impacts',
        tags: ['lawful'],
        relevanceScore: 5,
        impacts: [
          {
            id: 'impact-1',
            type: 'reputation',
            target: 'Dusty Gulch',
            severity: 'minor',
            description: 'Minor reputation change',
            value: 2
          },
          {
            id: 'impact-2',
            type: 'relationship',
            target: 'Sheriff Johnson',
            severity: 'major',
            description: 'Major relationship change',
            value: 8
          },
          {
            id: 'impact-3',
            type: 'world-state',
            target: 'Outlaw Gang',
            severity: 'moderate',
            description: 'Moderate world state change',
            value: -5
          }
        ],
        processedForImpact: true,
        lastImpactUpdate: Date.now()
      };
      
      const significantImpacts = getMostSignificantImpacts([record], 2);
      
      // Should return the 2 most significant impacts (highest absolute value)
      expect(significantImpacts.length).toBe(2);
      expect(significantImpacts[0].value).toBe(8); // Most significant
      expect(significantImpacts[1].value).toBe(-5); // Second most significant
    });
    
    it('should handle empty records array', () => {
      const significantImpacts = getMostSignificantImpacts([], 5);
      
      expect(significantImpacts).toEqual([]);
    });
  });
});