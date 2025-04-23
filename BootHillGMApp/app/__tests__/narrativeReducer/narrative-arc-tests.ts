/**
 * Tests for narrative arc and branch actions
 */
import { testNarrativeReducer as narrativeReducer } from '../../reducers/narrativeReducer';
import { 
  startNarrativeArc,
  completeNarrativeArc,
  activateBranch,
  completeBranch
} from '../../actions/narrativeActions';
import { createNarrativeTestState, getNarrativeState } from '../../test/utils/narrativeUtils';
import { ActionTypes } from '../../types/actionTypes';

describe('Narrative Arc Actions', () => {
  let initialState: ReturnType<typeof createNarrativeTestState>;

  beforeEach(() => {
    initialState = createNarrativeTestState();
  });

  describe('START_NARRATIVE_ARC action', () => {
    it('should start a narrative arc and activate the starting branch', () => {
      const action = startNarrativeArc('arc1');
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.START_NARRATIVE_ARC);
      
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);
      expect(narrativeState?.narrativeContext?.currentArcId).toBe('arc1');
      expect(narrativeState?.narrativeContext?.narrativeBranches?.['branch1'].isActive).toBe(true);
    });

    it('should not start a non-existent arc', () => {
      const action = startNarrativeArc('non-existent-arc');
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.START_NARRATIVE_ARC);
      
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
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.COMPLETE_NARRATIVE_ARC);
      
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);
      expect(narrativeState?.narrativeContext?.narrativeArcs?.['arc1'].isCompleted).toBe(true);
    });
  });

  describe('ACTIVATE_BRANCH action', () => {
    it('should activate a narrative branch', () => {
      const action = activateBranch('branch1');
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.ACTIVATE_BRANCH);
      
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);
      expect(narrativeState?.narrativeContext?.narrativeBranches?.['branch1'].isActive).toBe(true);
      expect(narrativeState?.narrativeContext?.currentBranchId).toBe('branch1');
    });
  });

  describe('COMPLETE_BRANCH action', () => {
    it('should mark a branch as completed', () => {
      const action = completeBranch('branch1');
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.COMPLETE_BRANCH);
      
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);
      expect(narrativeState?.narrativeContext?.narrativeBranches?.['branch1'].isActive).toBe(false);
      expect(narrativeState?.narrativeContext?.narrativeBranches?.['branch1'].isCompleted).toBe(true);
    });
  });
});