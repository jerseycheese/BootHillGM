/**
 * Unit tests for the narrative reducer
 */
import { narrativeReducer, 
  navigateToPoint, 
  selectChoice, 
  addNarrativeHistory,
  setDisplayMode,
  startNarrativeArc,
  completeNarrativeArc,
  activateBranch,
  completeBranch,
  updateNarrativeContext,
  resetNarrative
} from '../reducers/narrativeReducer';
import { initialNarrativeState, StoryPoint } from '../types/narrative.types';
import { GameState } from '../types/gameState';

describe('narrativeReducer', () => {
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
          playerChoices: [],
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

      expect(newState.narrative?.currentStoryPoint?.id).toBe('point1');
      expect(newState.narrative?.availableChoices).toHaveLength(2);
      expect(newState.narrative?.visitedPoints).toContain('point1');
    });

    it('should not navigate to an invalid story point', () => {
      const action = navigateToPoint('non-existent-point');
      const newState = narrativeReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('SELECT_CHOICE action', () => {
    it('should select a valid choice', () => {
      // First navigate to a point with choices
      const state = narrativeReducer(initialState, navigateToPoint('point1'));

      // Then select a choice
      const action = selectChoice('choice1');
      const newState = narrativeReducer(state, action);

      expect(newState.narrative?.selectedChoice).toBe('choice1');
    });

    it('should not select an invalid choice', () => {
      // First navigate to a point with choices
      const state = narrativeReducer(initialState, navigateToPoint('point1'));

      // Try to select an invalid choice
      const action = selectChoice('non-existent-choice');
      const newState = narrativeReducer(state, action);

      expect(newState).toEqual(state);
    });
  });

  describe('ADD_NARRATIVE_HISTORY action', () => {
    it('should add an entry to narrative history', () => {
      const historyEntry = 'The sheriff enters the saloon.';
      const action = addNarrativeHistory(historyEntry);
      const newState = narrativeReducer(initialState, action);

      expect(newState.narrative?.narrativeHistory).toContain(historyEntry);
      expect(newState.narrative?.narrativeHistory).toContain(historyEntry);
      expect(newState.narrative?.narrativeHistory).toHaveLength(
        (initialState.narrative?.narrativeHistory?.length || 0) + 1
      );
    });
  });

  describe('SET_DISPLAY_MODE action', () => {
    it('should update the display mode', () => {
      const action = setDisplayMode('flashback');
      const newState = narrativeReducer(initialState, action);

      expect(newState.narrative?.displayMode).toBe('flashback');
    });
  });

    describe('START_NARRATIVE_ARC action', () => {
        it('should start a narrative arc and activate the starting branch', () => {
          const action = startNarrativeArc('arc1');
          const newState = narrativeReducer(initialState, action);
    
          expect(newState.narrative?.narrativeContext?.currentArcId).toBe('arc1');
          expect(newState.narrative?.narrativeContext?.narrativeBranches?.['branch1'].isActive).toBe(true);
        });

    it('should not start a non-existent arc', () => {
      const action = startNarrativeArc('non-existent-arc');
      const newState = narrativeReducer(initialState, action);
      
      expect(newState).toEqual(initialState);
    });
  });

  describe('COMPLETE_NARRATIVE_ARC action', () => {
    it('should mark a narrative arc as completed', () => {
      const action = completeNarrativeArc('arc1');
      const newState = narrativeReducer(initialState, action);
      
      expect(newState.narrative?.narrativeContext?.narrativeArcs?.['arc1'].isCompleted).toBe(true);
    });
  });

  describe('ACTIVATE_BRANCH action', () => {
    it('should activate a narrative branch', () => {
      const action = activateBranch('branch1');
      const newState = narrativeReducer(initialState, action);
      
      expect(newState.narrative?.narrativeContext?.narrativeBranches?.['branch1'].isActive).toBe(true);
      expect(newState.narrative?.narrativeContext?.currentBranchId).toBe('branch1');
    });
  });

  describe('COMPLETE_BRANCH action', () => {
    it('should mark a branch as completed', () => {
      const action = completeBranch('branch1');
      const newState = narrativeReducer(initialState, action);
      
      expect(newState.narrative?.narrativeContext?.narrativeBranches?.['branch1'].isActive).toBe(false);
      expect(newState.narrative?.narrativeContext?.narrativeBranches?.['branch1'].isCompleted).toBe(true);
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
      
      expect(newState.narrative?.narrativeContext?.tone).toBe('mysterious');
      expect(newState.narrative?.narrativeContext?.themes).toContain('supernatural');
      // Original values should be preserved
      expect(newState.narrative?.narrativeContext?.characterFocus).toEqual(['player']);
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

      expect(newState.narrative).toEqual(initialNarrativeState);
    });
  });
});
