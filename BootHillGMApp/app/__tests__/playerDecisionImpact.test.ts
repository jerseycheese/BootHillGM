import { 
  PlayerDecision,
  PlayerDecisionOption,
  PlayerDecisionRecord,
  PlayerDecisionRecordWithImpact
} from '../types/narrative.types';
import { createDecisionRecord } from '../utils/decisionUtils';
import { 
  createDecisionImpacts,
  addImpactsToDecisionRecord
} from '../utils/decisionImpactUtils';

// Mock uuid to ensure consistent IDs in tests
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

describe('Player Decision Impact Integration', () => {
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

  describe('Decision Record with Impact', () => {
    it('should create a decision record and add impacts', () => {
      // First create a standard decision record
      const decisionRecord = createDecisionRecord(
        mockDecision,
        'option-1',
        'You decided to help the sheriff, earning his trust.'
      );
      
      // Then create impacts based on the decision
      const impacts = createDecisionImpacts(mockDecision, 'option-1');
      
      // Finally, add the impacts to the decision record
      const recordWithImpact = addImpactsToDecisionRecord(decisionRecord, impacts);
      
      // Verify the record has the expected properties
      expect(recordWithImpact).toHaveProperty('decisionId', 'decision-1');
      expect(recordWithImpact).toHaveProperty('selectedOptionId', 'option-1');
      expect(recordWithImpact).toHaveProperty('impacts');
      expect(recordWithImpact).toHaveProperty('processedForImpact', false);
      expect(recordWithImpact).toHaveProperty('lastImpactUpdate');
      
      // Verify the impacts array contains the expected impacts
      expect(recordWithImpact.impacts.length).toBeGreaterThan(0);
      
      // Verify that the record is a valid PlayerDecisionRecordWithImpact
      const isValidRecord = (record: PlayerDecisionRecordWithImpact): record is PlayerDecisionRecordWithImpact => {
        return (
          'decisionId' in record &&
          'selectedOptionId' in record &&
          'impacts' in record &&
          'processedForImpact' in record &&
          'lastImpactUpdate' in record
        );
      };
      
      expect(isValidRecord(recordWithImpact)).toBe(true);
    });
    
    it('should preserve all properties from the original decision record', () => {
      // Create a standard decision record
      const decisionRecord = createDecisionRecord(
        mockDecision,
        'option-1',
        'You decided to help the sheriff, earning his trust.'
      );
      
      // Add impacts
      const impacts = createDecisionImpacts(mockDecision, 'option-1');
      const recordWithImpact = addImpactsToDecisionRecord(decisionRecord, impacts);
      
      // Verify all original properties are preserved
      Object.keys(decisionRecord).forEach(key => {
        expect(recordWithImpact).toHaveProperty(key);
        expect(recordWithImpact[key as keyof PlayerDecisionRecord]).toEqual(
          decisionRecord[key as keyof PlayerDecisionRecord]
        );
      });
    });
  });

  describe('Impact Creation', () => {
    it('should create appropriate impacts based on decision text', () => {
      // Create a decision with specific impact text
      const reputationDecision: PlayerDecision = {
        ...mockDecision,
        options: [{
          id: 'option-1',
          text: 'Help the sheriff',
          impact: 'Significantly improve your reputation in town',
          tags: ['lawful']
        }]
      };
      
      // Create impacts
      const impacts = createDecisionImpacts(reputationDecision, 'option-1');
      
      // Verify reputation impact was created
      const reputationImpact = impacts.find(impact => impact.type === 'reputation');
      expect(reputationImpact).toBeDefined();
      expect(reputationImpact?.target).toBe('Dusty Gulch');
      expect(reputationImpact?.value).toBeGreaterThan(0);
      
      // Create a decision with relationship impact text
      const relationshipDecision: PlayerDecision = {
        ...mockDecision,
        options: [{
          id: 'option-1',
          text: 'Help the sheriff',
          impact: 'Improve your relationship with Sheriff Johnson',
          tags: ['lawful']
        }]
      };
      
      // Create impacts
      const relationshipImpacts = createDecisionImpacts(relationshipDecision, 'option-1');
      
      // Verify relationship impact was created
      const relationshipImpact = relationshipImpacts.find(impact => impact.type === 'relationship');
      expect(relationshipImpact).toBeDefined();
      expect(relationshipImpact?.target).toBe('Sheriff Johnson');
      expect(relationshipImpact?.value).toBeGreaterThan(0);
    });
    
    it('should set impact severity based on decision importance', () => {
      // Create a critical decision
      const criticalDecision: PlayerDecision = {
        ...mockDecision,
        importance: 'critical'
      };
      
      // Create impacts
      const criticalImpacts = createDecisionImpacts(criticalDecision, 'option-1');
      
      // Verify severity is 'major'
      expect(criticalImpacts[0].severity).toBe('major');
      
      // Create a minor decision
      const minorDecision: PlayerDecision = {
        ...mockDecision,
        importance: 'minor'
      };
      
      // Create impacts
      const minorImpacts = createDecisionImpacts(minorDecision, 'option-1');
      
      // Verify severity is 'minor'
      expect(minorImpacts[0].severity).toBe('minor');
    });
  });
});