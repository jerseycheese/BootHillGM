/**
 * Decision Context
 * 
 * Provides context for player decisions and options management
 * throughout the game interface.
 */
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { PlayerDecision, PlayerDecisionOption } from '../types/narrative/decision.types';

// Define custom types needed in this file

// Define extended PlayerDecision type
interface ExtendedPlayerDecision extends PlayerDecision {
  selectedOption?: PlayerDecisionOption | null; // Use PlayerDecisionOption
  metadata?: Record<string, string>;
}

// Define context state type
interface DecisionState {
  activeDecision: ExtendedPlayerDecision | null;
  previousDecisions: ExtendedPlayerDecision[];
  isProcessing: boolean;
  error: string | null;
}

// Define action types
type DecisionAction = 
  | { type: 'SET_DECISION'; payload: ExtendedPlayerDecision }
  | { type: 'CLEAR_DECISION' }
  | { type: 'SELECT_OPTION'; payload: PlayerDecisionOption } // Use PlayerDecisionOption
  | { type: 'START_PROCESSING' }
  | { type: 'END_PROCESSING' }
  | { type: 'SET_ERROR'; payload: string };

// Define context type
interface DecisionContextType {
  state: DecisionState;
  setDecision: (decision: ExtendedPlayerDecision) => void;
  clearDecision: () => void;
  selectOption: (option: PlayerDecisionOption) => void; // Use PlayerDecisionOption
  startProcessing: () => void;
  endProcessing: () => void;
  setError: (error: string) => void;
}

// Helper function declarations for use in reducer
// Define clearDecision before it's used in the reducer
function clearDecision(dispatch: React.Dispatch<DecisionAction>) {
  dispatch({ type: 'CLEAR_DECISION' });
}

// Create initial state
const initialState: DecisionState = {
  activeDecision: null,
  previousDecisions: [],
  isProcessing: false,
  error: null
};

// Create context
const DecisionContext = createContext<DecisionContextType | null>(null);

// Create reducer function
function decisionReducer(state: DecisionState, action: DecisionAction): DecisionState {
  switch (action.type) {
    case 'SET_DECISION':
      return {
        ...state,
        activeDecision: action.payload,
        error: null
      };
    case 'CLEAR_DECISION':
      // Only add to previous decisions if there was an active decision
      return {
        ...state,
        activeDecision: null,
        previousDecisions: state.activeDecision 
          ? [...state.previousDecisions, state.activeDecision]
          : state.previousDecisions,
        error: null
      };
    case 'SELECT_OPTION':
      if (!state.activeDecision) {
        return state;
      }
      return {
        ...state,
        activeDecision: {
          ...state.activeDecision,
          selectedOption: action.payload
        }
      };
    case 'START_PROCESSING':
      return {
        ...state,
        isProcessing: true
      };
    case 'END_PROCESSING':
      return {
        ...state,
        isProcessing: false
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
}

// Create provider component
interface DecisionProviderProps {
  children: ReactNode;
}

export const DecisionProvider: React.FC<DecisionProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(decisionReducer, initialState);
  
  // Action creators
  const setDecision = useCallback((decision: ExtendedPlayerDecision) => {
    dispatch({ type: 'SET_DECISION', payload: decision });
  }, []);
  
  // Use the pre-declared clearDecision function
  const clearDecisionHandler = useCallback(() => {
    clearDecision(dispatch);
  }, [dispatch]);
  
  const selectOption = useCallback((option: PlayerDecisionOption) => { // Use PlayerDecisionOption
    dispatch({ type: 'SELECT_OPTION', payload: option });
  }, []);
  
  const startProcessing = useCallback(() => {
    dispatch({ type: 'START_PROCESSING' });
  }, []);
  
  const endProcessing = useCallback(() => {
    dispatch({ type: 'END_PROCESSING' });
  }, []);
  
  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);
  
  // Create value object
  const value: DecisionContextType = {
    state,
    setDecision,
    clearDecision: clearDecisionHandler,
    selectOption,
    startProcessing,
    endProcessing,
    setError
  };
  
  return (
    <DecisionContext.Provider value={value}>
      {children}
    </DecisionContext.Provider>
  );
};

// Create custom hook
export const useDecision = (): DecisionContextType => {
  const context = useContext(DecisionContext);
  if (!context) {
    throw new Error('useDecision must be used within a DecisionProvider');
  }
  return context;
};

// Helper functions for creating different types of decisions
export const createCombatDecision = (
  prompt: string,
  options: PlayerDecisionOption[] // Use PlayerDecisionOption
): ExtendedPlayerDecision => ({
  id: `combat_${Date.now()}`,
  prompt,
  options,
  selectedOption: null,
  timestamp: Date.now(),
  context: '',
  importance: 'significant',
  aiGenerated: false,
  metadata: { category: 'combat' }
});

export const createDialogDecision = (
  prompt: string,
  options: PlayerDecisionOption[], // Use PlayerDecisionOption
  speaker?: string
): ExtendedPlayerDecision => ({
  id: `dialog_${Date.now()}`,
  prompt,
  options,
  selectedOption: null,
  timestamp: Date.now(),
  context: '',
  importance: 'moderate',
  aiGenerated: false,
  metadata: { category: 'dialog', speaker: speaker || '' }
});

export const createExplorationDecision = (
  prompt: string,
  options: PlayerDecisionOption[], // Use PlayerDecisionOption
  location?: string
): ExtendedPlayerDecision => ({
  id: `exploration_${Date.now()}`,
  prompt,
  options,
  selectedOption: null,
  timestamp: Date.now(),
  context: '',
  importance: 'minor',
  aiGenerated: false,
  metadata: { category: 'exploration', location: location || '' }
});