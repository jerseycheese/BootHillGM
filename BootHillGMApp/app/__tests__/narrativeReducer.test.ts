/**
 * Unit tests for the narrative reducer
 */
import { testNarrativeReducer as narrativeReducer } from '../reducers/narrativeReducer';
import { 
  navigateToPoint,
  selectChoice,
  addNarrativeHistory,
  setDisplayMode,
  startNarrativeArc,
  completeNarrativeArc,
  activateBranch,
  completeBranch,
  updateNarrativeContext,
  resetNarrative,
  presentDecision,
  recordDecision,
  clearCurrentDecision,
  clearError
} from '../actions/narrativeActions';

import { initialNarrativeState, StoryPoint, DecisionImportance } from '../types/narrative.types';
import { GameState } from '../types/gameState';
import { NarrativeState } from '../types/narrative.types';

describe('narrativeReducer', () => {
  // Helper function to get narrative state
  const getNarrativeState = (state: NarrativeState | Partial<GameState>): NarrativeState => {
    return 'narrative' in state ? state.narrative as NarrativeState : state as NarrativeState;
  }

  // Mock story points for testing
  const mockStoryPoints: Record<string, StoryPoint> = {
    'point1': {
      id: 'point1',
      type: 'exposition',
      title: 'Introduction',
      content: 'You enter the saloon.',
      choices: [
        {
          id: 'choice1',
          text: 'Go to the bar',
          leadsTo: 'point2'
        },
        {
          id: 'choice2',
          text: 'Find a table',
          leadsTo: 'point3'
        }
      ]
    },
    'point2': {
      id: 'point2',
      type: 'decision',
      title: 'At the Bar',
      content: 'The bartender looks at you.',
      choices: [
        {
          id: 'choice3',
          text: 'Order a drink',
          leadsTo: 'point4'
        }
      ]
    }
  };

  // Initial test state
  let initialState: Partial<GameState>;
  
  beforeEach(() => {
    initialState = {
      narrative: {
        ...initialNarrativeState,
        narrativeContext: {
          tone: 'serious',
          characterFocus: ['player'],
          themes: ['western'],
          worldContext: 'Wild West town',
          importantEvents: [],
          activeDecision: undefined,
          pendingDecisions: [],
          decisionHistory: [],
          storyPoints: mockStoryPoints,
          narrativeArcs: {
            'arc1': {
              id: 'arc1',
              title: 'Saloon Encounter',
              description: 'A tense encounter at the local saloon',
              branches: [],
              startingBranch: 'branch1',
              isCompleted: false
            }
          },
          narrativeBranches: {
            'branch1': {
              id: 'branch1',
              title: 'Bar Fight',
              startPoint: 'point1',
              endPoints: ['point4'],
              isActive: false
            }
          }
        }
      }
    };
  });

  describe('NAVIGATE_TO_POINT action', () => {
    it('should navigate to a valid story point', () => {
      const action = navigateToPoint('point1');
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);

      expect(narrativeState?.currentStoryPoint?.id).toBe('point1');
      expect(narrativeState?.availableChoices).toHaveLength(2);
      expect(narrativeState?.visitedPoints).toContain('point1');
    });

    it('should not navigate to an invalid story point', () => {
      const action = navigateToPoint('non-existent-point');
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);
      
      // With our new error handling, we expect an error object to be set
      expect(narrativeState.error).toBeDefined();
      expect(narrativeState.error?.code).toBe('invalid_navigation');
      expect(narrativeState.error?.context?.storyPointId).toBe('non-existent-point');
      
      // Core state should remain unchanged
      expect(narrativeState.currentStoryPoint).toEqual(initialState.narrative?.currentStoryPoint);
      expect(narrativeState.availableChoices).toEqual(initialState.narrative?.availableChoices);
    });
  });

  describe('SELECT_CHOICE action', () => {
    it('should select a valid choice', () => {
      // First navigate to a point with choices
      let state = narrativeReducer(initialState, navigateToPoint('point1'));

      // Then select a choice
      const action = selectChoice('choice1');
      state = narrativeReducer(state, action);
      const narrativeState = getNarrativeState(state);
      expect(narrativeState?.selectedChoice).toBe('choice1');
    });

    it('should not select an invalid choice', () => {
      // First navigate to a point with choices
      let state = narrativeReducer(initialState, navigateToPoint('point1'));
      
      // Try to select an invalid choice
      const action = selectChoice('non-existent-choice');
      state = narrativeReducer(state, action);
      const narrativeState = getNarrativeState(state);
      
      // With our new error handling, we expect an error object to be set
      expect(narrativeState.error).toBeDefined();
      expect(narrativeState.error?.code).toBe('invalid_choice');
      expect(narrativeState.error?.context?.choiceId).toBe('non-existent-choice');
      
      // No choice should be selected
      expect(narrativeState.selectedChoice).toBeUndefined();
    });
  });

  describe('ADD_NARRATIVE_HISTORY action', () => {
    it('should add an entry to narrative history', () => {
      const historyEntry = 'The sheriff enters the saloon.';
      const action = addNarrativeHistory(historyEntry);
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);
      expect(narrativeState?.narrativeHistory).toContain(historyEntry);
      expect(narrativeState?.narrativeHistory).toHaveLength(
        (initialState.narrative?.narrativeHistory?.length || 0) + 1
      );
    });
  });

  describe('SET_DISPLAY_MODE action', () => {
    it('should update the display mode', () => {
      const action = setDisplayMode('flashback');
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);
      expect(narrativeState?.displayMode).toBe('flashback');
    });
  });

  describe('START_NARRATIVE_ARC action', () => {
      it('should start a narrative arc and activate the starting branch', () => {
        const action = startNarrativeArc('arc1');
        const newState = narrativeReducer(initialState, action);
        const narrativeState = getNarrativeState(newState);
        expect(narrativeState?.narrativeContext?.currentArcId).toBe('arc1');
        expect(narrativeState?.narrativeContext?.narrativeBranches?.['branch1'].isActive).toBe(true);
      });

      it('should not start a non-existent arc', () => {
        const action = startNarrativeArc('non-existent-arc');
        const newState = narrativeReducer(initialState, action);
        const narrativeState = getNarrativeState(newState);
        
        // With our new error handling, we expect an error object to be set
        expect(narrativeState.error).toBeDefined();
        expect(narrativeState.error?.code).toBe('arc_not_found');
        expect(narrativeState.error?.context?.arcId).toBe('non-existent-arc');
        
        // No arc should be started
        expect(narrativeState.narrativeContext?.currentArcId).toBeUndefined();
      });
  });

  describe('COMPLETE_NARRATIVE_ARC action', () => {
      it('should mark a narrative arc as completed', () => {
          const action = completeNarrativeArc('arc1');
          const newState = narrativeReducer(initialState, action);
          const narrativeState = getNarrativeState(newState);
          expect(narrativeState?.narrativeContext?.narrativeArcs?.['arc1'].isCompleted).toBe(true);
      });
  });

  describe('ACTIVATE_BRANCH action', () => {
      it('should activate a narrative branch', () => {
          const action = activateBranch('branch1');
          const newState = narrativeReducer(initialState, action);
          const narrativeState = getNarrativeState(newState);
          expect(narrativeState?.narrativeContext?.narrativeBranches?.['branch1'].isActive).toBe(true);
          expect(narrativeState?.narrativeContext?.currentBranchId).toBe('branch1');
      });
  });

  describe('COMPLETE_BRANCH action', () => {
      it('should mark a branch as completed', () => {
          const action = completeBranch('branch1');
          const newState = narrativeReducer(initialState, action);
          const narrativeState = getNarrativeState(newState);
          expect(narrativeState?.narrativeContext?.narrativeBranches?.['branch1'].isActive).toBe(false);
          expect(narrativeState?.narrativeContext?.narrativeBranches?.['branch1'].isCompleted).toBe(true);
      });
  });

  describe('UPDATE_NARRATIVE_CONTEXT action', () => {
      it('should update narrative context properties', () => {
        const contextUpdate = {
          tone: 'mysterious' as const,
          themes: ['supernatural', 'western']
        };
        
        const action = updateNarrativeContext(contextUpdate);
        const newState = narrativeReducer(initialState, action);
        const narrativeState = getNarrativeState(newState);
        expect(narrativeState?.narrativeContext?.tone).toBe('mysterious');
        expect(narrativeState?.narrativeContext?.themes).toContain('supernatural');
        // Original values should be preserved
        expect(narrativeState?.narrativeContext?.characterFocus).toEqual(['player']);
      });
  });

  describe('RESET_NARRATIVE action', () => {
      it('should reset the narrative state to initial values', () => {
          // First make some changes to the state.  Use a properly initialized
          // narrative state, not the full initialState.
          let state = narrativeReducer({ narrative: { ...initialNarrativeState, narrativeContext: initialState.narrative?.narrativeContext } }, navigateToPoint('point1'));
          state = narrativeReducer(state, selectChoice('choice1'));

          // Then reset
          const action = resetNarrative();
          const newState = narrativeReducer(state, action);
          const narrativeState = getNarrativeState(newState);
          expect(narrativeState).toEqual(initialNarrativeState);
      });
  });
  
  describe('Error handling actions', () => {
    it('should clear error state with CLEAR_ERROR action', () => {
      // First create an error
      let state = narrativeReducer(initialState, navigateToPoint('non-existent-point'));
      const errorState = getNarrativeState(state);
      expect(errorState.error).toBeDefined();
      
      // Then clear it
      state = narrativeReducer(state, clearError());
      const clearedState = getNarrativeState(state);
      expect(clearedState.error).toBeNull();
    });
  });
  
  describe('Decision tracking actions', () => {
    it('should handle PRESENT_DECISION action', () => {
      const mockDecision = {
        id: 'decision1',
        prompt: 'Test prompt',
        timestamp: Date.now(),
        options: [
          { id: 'option1', text: 'Option 1', impact: 'Impact 1' },
          { id: 'option2', text: 'Option 2', impact: 'Impact 2' }
        ],
        context: 'Test context',
        importance: 'moderate' as DecisionImportance,
        aiGenerated: true
      };
      
      const action = presentDecision(mockDecision);
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);
      
      expect(narrativeState?.currentDecision).toEqual(mockDecision);
    });

    it('should handle RECORD_DECISION action', () => {
      // Setup state with a current decision
      const mockDecision = {
        id: 'decision1',
        prompt: 'Test prompt',
        timestamp: Date.now(),
        options: [
          { id: 'option1', text: 'Option 1', impact: 'Impact 1' },
          { id: 'option2', text: 'Option 2', impact: 'Impact 2' }
        ],
        context: 'Test context',
        importance: 'moderate' as DecisionImportance,
        aiGenerated: true
      };
      
      let state = narrativeReducer(initialState, presentDecision(mockDecision));
      
      // Record the decision
      const action = recordDecision('decision1', 'option1', 'Test narrative');
      state = narrativeReducer(state, action);
      const narrativeState = getNarrativeState(state);
      
      // Verify the decision was recorded and current decision was cleared
      expect(narrativeState?.currentDecision).toBeUndefined();
      expect(narrativeState?.narrativeContext?.decisionHistory.length).toBe(1);
    });

    it('should handle CLEAR_CURRENT_DECISION action', () => {
      // Setup state with a current decision
      const mockDecision = {
        id: 'decision1',
        prompt: 'Test prompt',
        timestamp: Date.now(),
        options: [
          { id: 'option1', text: 'Option 1', impact: 'Impact 1' },
          { id: 'option2', text: 'Option 2', impact: 'Impact 2' }
        ],
        context: 'Test context',
        importance: 'moderate' as DecisionImportance,
        aiGenerated: true
      };
      
      let state = narrativeReducer(initialState, presentDecision(mockDecision));
      
      // Clear the decision
      const action = clearCurrentDecision();
      state = narrativeReducer(state, action);
      const narrativeState = getNarrativeState(state);
      
      // Verify the decision was cleared
      expect(narrativeState?.currentDecision).toBeUndefined();
    });
  });
});
