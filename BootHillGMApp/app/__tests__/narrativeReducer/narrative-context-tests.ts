/**
 * Tests for narrative context and state management actions
 */
import { testNarrativeReducer as narrativeReducer } from '../../reducers/narrativeReducer';
import { 
  updateNarrativeContext,
  resetNarrative,
  navigateToPoint,
  selectChoice
} from '../../actions/narrativeActions';
import { initialNarrativeState } from '../../types/narrative.types';
import { createNarrativeTestState, getNarrativeState } from '../../test/utils/narrativeUtils';

describe('Narrative Context Actions', () => {
  let initialState: ReturnType<typeof createNarrativeTestState>;

  beforeEach(() => {
    initialState = createNarrativeTestState();
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
      let state = narrativeReducer(
        { 
          narrative: { 
            ...initialNarrativeState, 
            narrativeContext: initialState.narrative?.narrativeContext 
          } 
        }, 
        navigateToPoint('point1')
      );
      state = narrativeReducer(state, selectChoice('choice1'));

      // Then reset
      const action = resetNarrative();
      const newState = narrativeReducer(state, action);
      const narrativeState = getNarrativeState(newState);
      expect(narrativeState).toEqual(initialNarrativeState);
    });
  });
});