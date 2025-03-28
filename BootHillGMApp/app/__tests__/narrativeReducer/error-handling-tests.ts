/**
 * Tests for error handling in the narrative reducer
 */
import { testNarrativeReducer as narrativeReducer } from '../../reducers/narrativeReducer';
import { 
  navigateToPoint,
  clearError
} from '../../actions/narrativeActions';
import { createNarrativeTestState, getNarrativeState } from '../../test/utils/narrativeUtils';

describe('Error Handling Actions', () => {
  let initialState: ReturnType<typeof createNarrativeTestState>;

  beforeEach(() => {
    initialState = createNarrativeTestState();
  });

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