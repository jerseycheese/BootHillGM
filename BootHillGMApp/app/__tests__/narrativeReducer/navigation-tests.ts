/**
 * Tests for narrative navigation actions
 */
import { testNarrativeReducer as narrativeReducer } from '../../reducers/narrativeReducer';
import { 
  navigateToPoint,
  selectChoice,
  addNarrativeHistory,
  setDisplayMode
} from '../../actions/narrativeActions';
import { createNarrativeTestState, getNarrativeState } from '../../test/utils/narrativeUtils';
import { ActionTypes } from '../../types/actionTypes';

describe('Navigation Actions', () => {
  let initialState: ReturnType<typeof createNarrativeTestState>;

  beforeEach(() => {
    initialState = createNarrativeTestState();
  });

  describe('NAVIGATE_TO_POINT action', () => {
    it('should navigate to a valid story point', () => {
      const action = navigateToPoint('point1');
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.NAVIGATE_TO_POINT);
      
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);

      expect(narrativeState?.currentStoryPoint?.id).toBe('point1');
      expect(narrativeState?.availableChoices).toHaveLength(2);
      expect(narrativeState?.visitedPoints).toContain('point1');
    });

    it('should not navigate to an invalid story point', () => {
      const action = navigateToPoint('non-existent-point');
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.NAVIGATE_TO_POINT);
      
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
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.SELECT_CHOICE);
      
      state = narrativeReducer(state, action);
      const narrativeState = getNarrativeState(state);
      expect(narrativeState?.selectedChoice).toBe('choice1');
    });

    it('should not select an invalid choice', () => {
      // First navigate to a point with choices
      let state = narrativeReducer(initialState, navigateToPoint('point1'));
      
      // Try to select an invalid choice
      const action = selectChoice('non-existent-choice');
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.SELECT_CHOICE);
      
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
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.ADD_NARRATIVE_HISTORY);
      
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
      // Ensure the action is using the standardized ActionTypes
      expect(action.type).toBe(ActionTypes.SET_DISPLAY_MODE);
      
      const newState = narrativeReducer(initialState, action);
      const narrativeState = getNarrativeState(newState);
      expect(narrativeState?.displayMode).toBe('flashback');
    });
  });
});