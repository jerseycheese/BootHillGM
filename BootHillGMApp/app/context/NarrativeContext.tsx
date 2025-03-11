'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { 
  NarrativeState, 
  NarrativeAction, 
  initialNarrativeState
} from '../types/narrative.types';
import { narrativeReducer } from '../reducers/narrativeReducer';

/**
 * Context type definition for the NarrativeContext
 */
type NarrativeContextValue = {
  state: NarrativeState;
  dispatch: React.Dispatch<NarrativeAction>;
  saveNarrativeState: (state: NarrativeState) => void;
  loadNarrativeState: () => NarrativeState | null;
  resetNarrativeState: () => void;
};

/**
 * Create a context for narrative state management
 */
const NarrativeContext = createContext<NarrativeContextValue | undefined>(undefined);

/**
 * Props for the NarrativeProvider component
 */
interface NarrativeProviderProps {
  children: React.ReactNode;
  initialState?: NarrativeState;
}

/**
 * The localStorage key used for saving narrative state
 */
const NARRATIVE_STATE_STORAGE_KEY = 'narrativeState';

/**
 * NarrativeProvider component - provides narrative context to the application
 * 
 * Handles:
 * - State management via the narrative reducer
 * - Persistence to localStorage
 * - State loading and restoration
 * - Error handling for state operations
 */
export const NarrativeProvider: React.FC<NarrativeProviderProps> = ({ 
  children, 
  initialState = initialNarrativeState
}) => {
  const [state, dispatch] = useReducer(narrativeReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const savedState = localStorage.getItem(NARRATIVE_STATE_STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // Dispatch the state to the reducer
          dispatch({
            type: 'UPDATE_NARRATIVE',
            payload: parsedState
          });
        }
      } catch (error) {
        console.error('Error loading narrative state from localStorage:', error);
        // Continue with initial state on error
      } finally {
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  /**
   * Save narrative state to localStorage
   */
  const saveNarrativeState = useCallback((narrativeState: NarrativeState) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(NARRATIVE_STATE_STORAGE_KEY, JSON.stringify(narrativeState));
      } catch (error) {
        console.error('Error saving narrative state to localStorage:', error);
        // TODO: Implement more robust error handling, possibly with user notification
      }
    }
  }, []);

  /**
   * Load narrative state from localStorage
   */
  const loadNarrativeState = useCallback((): NarrativeState | null => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem(NARRATIVE_STATE_STORAGE_KEY);
        if (!savedState) {
          return null;
        }

        const parsedState = JSON.parse(savedState) as NarrativeState;

        // Ensure we have all the required properties from initialNarrativeState
        return {
          ...initialNarrativeState,
          ...parsedState
        };
      } catch (error) {
        console.error('Error loading narrative state from localStorage:', error);
        return null;
      }
    }
    return null;
  }, []);

  /**
   * Reset narrative state to initial values
   */
  const resetNarrativeState = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(NARRATIVE_STATE_STORAGE_KEY);
      } catch (error) {
        console.error('Error removing narrative state from localStorage:', error);
      }
    }
    dispatch({ type: 'RESET_NARRATIVE' });
  }, [dispatch]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveNarrativeState(state);
    }
  }, [state, saveNarrativeState, isInitialized]);

  // Provide the context value to children
  const contextValue: NarrativeContextValue = {
    state,
    dispatch,
    saveNarrativeState,
    loadNarrativeState,
    resetNarrativeState
  };

  return (
    <NarrativeContext.Provider value={contextValue}>
      {children}
    </NarrativeContext.Provider>
  );
};

/**
 * Custom hook to use the narrative context
 *
 * @returns The narrative context value
 * @throws Error if used outside of a NarrativeProvider
 */
export const useNarrative = (): NarrativeContextValue => {
  const context = useContext(NarrativeContext);

  if (context === undefined) {
    throw new Error('useNarrative must be used within a NarrativeProvider');
  }

  return context;
};

/**
 * Default export for the context
 */
export default NarrativeContext;
