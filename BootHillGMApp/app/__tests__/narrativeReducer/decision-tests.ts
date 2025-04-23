/**
 * Tests for decision-related actions in the narrative reducer
 */
import { testNarrativeReducer as narrativeReducer } from '../../reducers/narrativeReducer';
import { 
  presentDecision,
  recordDecision,
  clearCurrentDecision
} from '../../actions/narrativeActions';
import { createNarrativeTestState, getNarrativeState, createMockDecision } from '../../test/utils/narrativeUtils';
import { ActionTypes } from '../../types/actionTypes';

describe('Decision Tracking Actions', () => {
  let initialState: ReturnType<typeof createNarrativeTestState>;

  beforeEach(() => {
    initialState = createNarrativeTestState();
  });

  it('should handle PRESENT_DECISION action', () => {
    const mockDecision = createMockDecision();
    
    const action = presentDecision(mockDecision);
    // Ensure the action is using the standardized ActionTypes
    expect(action.type).toBe(ActionTypes.PRESENT_DECISION);
    
    const newState = narrativeReducer(initialState, action);
    const narrativeState = getNarrativeState(newState);
    
    expect(narrativeState?.currentDecision).toEqual(mockDecision);
  });

  it('should handle RECORD_DECISION action', () => {
    // Setup state with a current decision
    const mockDecision = createMockDecision();
    
    let state = narrativeReducer(initialState, presentDecision(mockDecision));
    
    // Record the decision
    const action = recordDecision('decision1', 'option1', 'Test narrative');
    // Ensure the action is using the standardized ActionTypes
    expect(action.type).toBe(ActionTypes.RECORD_DECISION);
    
    state = narrativeReducer(state, action);
    const narrativeState = getNarrativeState(state);
    
    // Verify the decision was recorded and current decision was cleared
    expect(narrativeState?.currentDecision).toBeUndefined();
    expect(narrativeState?.narrativeContext?.decisionHistory.length).toBe(1);
  });

  it('should handle CLEAR_CURRENT_DECISION action', () => {
    // Setup state with a current decision
    const mockDecision = createMockDecision();
    
    let state = narrativeReducer(initialState, presentDecision(mockDecision));
    
    // Clear the decision
    const action = clearCurrentDecision();
    // Ensure the action is using the standardized ActionTypes
    expect(action.type).toBe(ActionTypes.CLEAR_CURRENT_DECISION);
    
    state = narrativeReducer(state, action);
    const narrativeState = getNarrativeState(state);
    
    // Verify the decision was cleared
    expect(narrativeState?.currentDecision).toBeUndefined();
  });
});