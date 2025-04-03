'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNarrative } from './NarrativeContext';
import AIDecisionService from '../services/ai/aiDecisionService';
import { PlayerDecision } from '../types/narrative.types';
import { Character } from '../types/character';

/**
 * Context value provided by the DecisionContext
 */
interface DecisionContextValue {
  // Current active decision
  currentDecision: PlayerDecision | null;
  
  // Is a decision currently being generated?
  isLoading: boolean;
  
  // Has an error occurred?
  error: Error | null;
  
  // Select an option from the current decision
  selectOption: (optionId: string) => Promise<void>;
  
  // Force check for a decision point
  checkForDecision: () => Promise<void>;
  
  // Clear the current decision
  clearDecision: () => void;
}

// Create the context with default value
const DecisionContext = createContext<DecisionContextValue | undefined>(undefined);

/**
 * Props for the DecisionProvider
 */
interface DecisionProviderProps {
  children: React.ReactNode;
  character: Character; // Player character
  decisionService?: AIDecisionService; // Optional custom service
}

/**
 * Provider component for Decision context
 */
export const DecisionProvider: React.FC<DecisionProviderProps> = ({ 
  children, 
  character,
  decisionService 
}) => {
  // Initialize the decision service if not provided
  const [service] = useState(() => decisionService || new AIDecisionService());
  
  // Access the narrative context
  // Rename 'narrativeState' to 'gameState' to reflect the actual content from useNarrative
  const { state: gameState, dispatch } = useNarrative();
  
  // Component state
  const [currentDecision, setCurrentDecision] = useState<PlayerDecision | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  
  /**
   * Generate a new decision based on current context
   */
  const generateDecision = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a decision from the service
      // Pass the narrative slice from the gameState
      const decision = await service.generateDecision(gameState.narrative, character);
      
      // PlayerDecision is now directly returned from generateDecision
      const playerDecision = decision;
      
      // Update state
      setCurrentDecision(playerDecision);
      
      // Also update narrative context to include this decision
      dispatch({
        type: 'PRESENT_DECISION',
        payload: playerDecision
      });
    } catch (err) {
      console.error('Error generating decision:', err);
      setError(err instanceof Error ? err : new Error('Failed to generate decision'));
    } finally {
      setIsLoading(false);
    }
  }, [gameState, character, service, dispatch]); // Updated dependency
  
  // Check for decision points when narrative context changes
  useEffect(() => {
    // Don't check too frequently
    const now = Date.now();
    if (now - lastCheckTime < 5000) { // 5 second minimum between auto-checks
      return;
    }
    
    // Don't check if we already have an active decision
    if (currentDecision || isLoading) {
      return;
    }
    
    // Check if we should present a decision
    const checkForDecisionPoint = async () => {
      try {
        // Pass the narrative slice from the gameState
        const result = service.detectDecisionPoint(gameState.narrative, character);
        
        if (result.shouldPresent) {
          await generateDecision();
        }
      } catch (err) {
        console.error('Error checking for decision point:', err);
        setError(err instanceof Error ? err : new Error('Failed to check for decision'));
      } finally {
        setLastCheckTime(now);
      }
    };
    
    checkForDecisionPoint();
  }, [gameState, character, lastCheckTime, currentDecision, isLoading, service, generateDecision]); // Updated dependency
  
  /**
   * Force check for decision point (can be triggered by player or game events)
   */
  const checkForDecision = async () => {
    if (isLoading || currentDecision) {
      return; // Already loading or have a decision
    }
    
    await generateDecision();
  };
  
  /**
   * Handle player selecting a decision option
   */
  const selectOption = async (optionId: string) => {
    if (!currentDecision) {
      return;
    }
    
    try {
      // Find the selected option
      const selectedOption = currentDecision.options.find(opt => opt.id === optionId);
      if (!selectedOption) {
        throw new Error(`Option ${optionId} not found in current decision`);
      }
      
      // Record the decision
      dispatch({
        type: 'RECORD_DECISION',
        payload: {
          decisionId: currentDecision.id,
          selectedOptionId: optionId,
          narrative: `You chose: ${selectedOption.text}`, // Basic narrative, would be expanded
          timestamp: Date.now(),
          impactDescription: `Impact of choosing: ${selectedOption.text}`,
          tags: [],
          relevanceScore: 1
        }
      });
      
      // Record in the decision service for future context
      service.recordDecision(
        currentDecision.id,
        optionId,
        `Player chose: ${selectedOption.text}`
      );
      
      // Clear the current decision
      clearDecision();
      
    } catch (err) {
      console.error('Error selecting decision option:', err);
      setError(err instanceof Error ? err : new Error('Failed to select option'));
    }
  };
  
  /**
   * Clear the current decision
   */
  const clearDecision = () => {
    setCurrentDecision(null);
    dispatch({ type: 'CLEAR_CURRENT_DECISION' });
  };
  
  // Create the context value
  const contextValue: DecisionContextValue = {
    currentDecision,
    isLoading,
    error,
    selectOption,
    checkForDecision,
    clearDecision
  };
  
  return (
    <DecisionContext.Provider value={contextValue}>
      {children}
    </DecisionContext.Provider>
  );
};

/**
 * Hook to use the decision context
 */
export const useDecision = (): DecisionContextValue => {
  const context = useContext(DecisionContext);
  if (!context) {
    throw new Error('useDecision must be used within a DecisionProvider');
  }
  return context;
};

export default DecisionContext;