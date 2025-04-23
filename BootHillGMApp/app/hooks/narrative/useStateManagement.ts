/**
 * Hook for managing state refresh in the narrative system
 */
import { useCallback } from 'react';
import { NarrativeContextValue } from './types';
import { addNarrativeHistory } from '../../actions/narrativeActions';
import { ActionTypes } from '../../types/actionTypes';

/**
 * Hook that provides functionality for managing state in the narrative context
 * 
 * @param context The narrative context
 * @returns Functions for managing state
 */
export function useStateManagement(context: NarrativeContextValue) {
  const { state, dispatch } = context;

  /**
   * Helper function to ensure narrative state is fresh before generating decisions
   * 
   * This function handles the state update to force a refresh before
   * decision generation to fix the stale context issue (#210).
   */
  const ensureFreshState = useCallback(async () => {
    // Force a state update to ensure we have the freshest state
    dispatch({
      type: ActionTypes.UPDATE_NARRATIVE,
      payload: { /* Intentionally empty */ }  // Empty object is valid and will trigger a state update
    });

    // Wait a small delay to ensure state has updated
    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), 50);
    });

    // Return the current state after refresh
    return state;
  }, [state, dispatch]);

  /**
   * Add context to narrative history
   */
  const addContextToHistory = useCallback((context: string) => {
    dispatch(addNarrativeHistory(`Context: ${context}`));
  }, [dispatch]);

  return {
    ensureFreshState,
    addContextToHistory
  };
}
