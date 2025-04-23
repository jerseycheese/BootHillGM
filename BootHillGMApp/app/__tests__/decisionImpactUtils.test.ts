import { 
  addImpactsToDecisionRecord,
  processDecisionImpacts,
  evolveImpactsOverTime,
  reconcileConflictingImpacts,
} from '../utils/decisionImpactUtils';
import { createDecisionImpacts } from '../utils/decisionImpactGenerator';
import { formatImpactsForAIContext } from '../utils/decisionImpactFormatter';
import { 
  PlayerDecision,
  PlayerDecisionOption,
  PlayerDecisionRecord,
  PlayerDecisionRecordWithImpact,
  DecisionImpact,
  ImpactState
} from '../types/narrative.types';

// Mock uuid to ensure consistent IDs in tests
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

describe('Decision Impact Utilities', () => {
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

  const mockDecisionRecord: PlayerDecisionRecord = {
    decisionId: 'decision-1',
    selectedOptionId: 'option-1',
    timestamp: Date.now(),
    narrative: 'You decided to help the sheriff, earning his trust.',
    impactDescription: 'Improve your reputation in town and relationship with the sheriff',
    tags: ['lawful', 'helpful', 'character:Sheriff Johnson'],
    relevanceScore: 8
  };

  const mockImpactState: ImpactState = {
    reputationImpacts: { 'Dusty Gulch': 2 },
    relationshipImpacts: { 'player': { 'Sheriff Johnson': 3 } },
    worldStateImpacts: { /* Intentionally empty */ },
    storyArcImpacts: { 'main': 10 },
    lastUpdated: Date.now()
  };

  describe('createDecisionImpacts', () => {
    it('should create impact objects based on decision and selected option', () => {
      const impacts = createDecisionImpacts(mockDecision, 'option-1');
      
      // Should create at least one impact
      expect(impacts.length).toBeGreaterThan(0);
      
      // Each impact should have the required properties
      impacts.forEach(impact => {
        expect(impact).toHaveProperty('id');
        expect(impact).toHaveProperty('type');
        expect(impact).toHaveProperty('target');
        expect(impact).toHaveProperty('severity');
        expect(impact).toHaveProperty('description');
        expect(impact).toHaveProperty('value');
      });
      
      // Should identify reputation impact from the text
      const reputationImpact = impacts.find(impact => impact.type === 'reputation');
      expect(reputationImpact).toBeDefined();
      
      // Should identify relationship impact from the text
      const relationshipImpact = impacts.find(impact => impact.type === 'relationship');
      expect(relationshipImpact).toBeDefined();
    });

    it('should throw an error if the selected option is not found', () => {
      expect(() => {
        createDecisionImpacts(mockDecision, 'non-existent-option');
      }).toThrow();
    });
  });

  describe('addImpactsToDecisionRecord', () => {
    it('should add impacts to a decision record', () => {
      const mockImpacts: DecisionImpact[] = [
        {
          id: 'impact-1',
          type: 'reputation',
          target: 'Dusty Gulch',
          severity: 'moderate',
          description: 'Improved reputation in town',
          value: 5
        }
      ];
      
      const result = addImpactsToDecisionRecord(mockDecisionRecord, mockImpacts);
      
      expect(result).toHaveProperty('impacts', mockImpacts);
      expect(result).toHaveProperty('processedForImpact', false);
      expect(result).toHaveProperty('lastImpactUpdate');
      expect(result.decisionId).toBe(mockDecisionRecord.decisionId);
      expect(result.selectedOptionId).toBe(mockDecisionRecord.selectedOptionId);
    });
  });

  describe('processDecisionImpacts', () => {
    it('should update impact state based on decision impacts', () => {
      const mockImpacts: DecisionImpact[] = [
        {
          id: 'impact-1',
          type: 'reputation',
          target: 'Dusty Gulch',
          severity: 'moderate',
          description: 'Improved reputation in town',
          value: 5
        },
        {
          id: 'impact-2',
          type: 'relationship',
          target: 'Sheriff Johnson',
          severity: 'moderate',
          description: 'Better relationship with the sheriff',
          value: 5
        }
      ];
      
      const mockRecordWithImpacts: PlayerDecisionRecordWithImpact = {
        ...mockDecisionRecord,
        impacts: mockImpacts,
        processedForImpact: false,
        lastImpactUpdate: Date.now()
      };
      
      const result = processDecisionImpacts(mockImpactState, mockRecordWithImpacts);
      
      // Should update reputation for Dusty Gulch
      expect(result.reputationImpacts['Dusty Gulch']).toBeGreaterThan(
        mockImpactState.reputationImpacts['Dusty Gulch']
      );
      
      // Should update lastUpdated timestamp
      expect(result.lastUpdated).toBeGreaterThanOrEqual(mockImpactState.lastUpdated);
    });

    it('should not process already processed decision records', () => {
      const mockImpacts: DecisionImpact[] = [
        {
          id: 'impact-1',
          type: 'reputation',
          target: 'Dusty Gulch',
          severity: 'moderate',
          description: 'Improved reputation in town',
          value: 5
        }
      ];
      
      const mockRecordWithImpacts: PlayerDecisionRecordWithImpact = {
        ...mockDecisionRecord,
        impacts: mockImpacts,
        processedForImpact: true, // Already processed
        lastImpactUpdate: Date.now()
      };
      
      const result = processDecisionImpacts(mockImpactState, mockRecordWithImpacts);
      
      // Should not change the impact state
      expect(result).toEqual(mockImpactState);
    });
  });

  describe('evolveImpactsOverTime', () => {
    it('should evolve impacts based on time elapsed', () => {
      const pastTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
      
      const mockImpacts: DecisionImpact[] = [
        {
          id: 'impact-1',
          type: 'reputation',
          target: 'Dusty Gulch',
          severity: 'minor',
          description: 'Temporary reputation boost',
          value: 5,
          duration: 7 * 24 * 60 * 60 * 1000 // 7 days
        }
      ];
      
      const mockRecordWithImpacts: PlayerDecisionRecordWithImpact = {
        ...mockDecisionRecord,
        impacts: mockImpacts,
        processedForImpact: true,
        lastImpactUpdate: pastTimestamp
      };
      
      const result = evolveImpactsOverTime(
        mockImpactState, 
        [mockRecordWithImpacts], 
        Date.now()
      );
      
      // Should reduce the impact of expired impacts
      expect(result.reputationImpacts['Dusty Gulch']).toBeLessThan(
        mockImpactState.reputationImpacts['Dusty Gulch']
      );
    });

    it('should not evolve impacts for unprocessed decision records', () => {
      const mockImpacts: DecisionImpact[] = [
        {
          id: 'impact-1',
          type: 'reputation',
          target: 'Dusty Gulch',
          severity: 'minor',
          description: 'Temporary reputation boost',
          value: 5,
          duration: 7 * 24 * 60 * 60 * 1000 // 7 days
        }
      ];
      
      const mockRecordWithImpacts: PlayerDecisionRecordWithImpact = {
        ...mockDecisionRecord,
        impacts: mockImpacts,
        processedForImpact: false, // Not processed
        lastImpactUpdate: Date.now() - (8 * 24 * 60 * 60 * 1000) // 8 days ago
      };
      
      const result = evolveImpactsOverTime(
        mockImpactState, 
        [mockRecordWithImpacts], 
        Date.now()
      );
      
      // Should not change the impact state
      expect(result.reputationImpacts['Dusty Gulch']).toEqual(
        mockImpactState.reputationImpacts['Dusty Gulch']
      );
    });
  });

  describe('reconcileConflictingImpacts', () => {
    it('should reconcile conflicting impacts on the same target', () => {
      const conflictingImpacts: DecisionImpact[] = [
        {
          id: 'impact-1',
          type: 'reputation',
          target: 'Dusty Gulch',
          severity: 'moderate',
          description: 'Improved reputation in town',
          value: 5
        },
        {
          id: 'impact-2',
          type: 'reputation',
          target: 'Dusty Gulch',
          severity: 'minor',
          description: 'Slightly improved reputation in town',
          value: 2
        }
      ];
      
      const result = reconcileConflictingImpacts(conflictingImpacts);
      
      // Should combine the impacts into one
      expect(result.length).toBe(1);
      
      // The combined impact should have a value between the sum and the max
      expect(result[0].value).toBeGreaterThan(5);
      expect(result[0].value).toBeLessThan(7);
    });

    it('should not reconcile impacts on different targets', () => {
      const nonConflictingImpacts: DecisionImpact[] = [
        {
          id: 'impact-1',
          type: 'reputation',
          target: 'Dusty Gulch',
          severity: 'moderate',
          description: 'Improved reputation in town',
          value: 5
        },
        {
          id: 'impact-2',
          type: 'reputation',
          target: 'Rattlesnake Ridge',
          severity: 'minor',
          description: 'Slightly improved reputation in another town',
          value: 2
        }
      ];
      
      const result = reconcileConflictingImpacts(nonConflictingImpacts);
      
      // Should not combine the impacts
      expect(result.length).toBe(2);
    });
  });

  describe('formatImpactsForAIContext', () => {
    it('should format impact state for AI context', () => {
      const result = formatImpactsForAIContext(mockImpactState);
      
      // Reputation impact is exactly 2, so it should NOT be included
      expect(result).not.toContain('Dusty Gulch');

      // Should include relationship impacts
      expect(result).toContain('Sheriff Johnson');
      
      // Should include story arc impacts
      expect(result).toContain('main');
    });

    it('should limit the number of entries based on maxEntries', () => {
      const largeImpactState: ImpactState = {
        reputationImpacts: {
          'Town1': 5,
          'Town2': 4,
          'Town3': 3,
          'Town4': 2,
          'Town5': 1,
          'Town6': 0
        },
        relationshipImpacts: { /* Intentionally empty */ },
        worldStateImpacts: { /* Intentionally empty */ },
        storyArcImpacts: { /* Intentionally empty */ },
        lastUpdated: Date.now()
      };
      
      const result = formatImpactsForAIContext(largeImpactState, 3);
      const lines = result.split('\n');
      
      // Should include header + 3 entries
      const reputationLines = lines.filter(line => line.includes('Town'));
      expect(reputationLines.length).toBe(3);
    });
  });
});
