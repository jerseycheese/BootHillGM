import { useContext, useCallback } from 'react';
import { 
  PlayerDecision, 
  PlayerDecisionRecord,
  DecisionImportance
} from '../types/narrative.types';
import NarrativeContext from '../context/NarrativeContext';
import { 
  presentDecision, 
  recordDecision, 
  clearCurrentDecision,
  processDecisionImpacts,
  addNarrativeHistory,
  updateNarrativeContext
} from '../reducers/narrativeReducer';
import { createDecisionRecord } from '../utils/decisionUtils';

/**
 * Custom hook for interacting with narrative context and player decisions
 * 
 * This hook provides a comprehensive API for working with the player decision
 * system. The hook manages:
 * 
 * - Presenting decisions to the player
 * - Recording player choices
 * - Maintaining decision history
 * - Triggering decisions based on narrative context
 * - Processing decision impacts on the game state
 * 
 * @returns Object with decision state and functions
 */
export function useNarrativeContext() {
  const context = useContext(NarrativeContext);
  
  if (!context) {
    throw new Error('useNarrativeContext must be used within a NarrativeProvider');
  }
  
  const { state, dispatch } = context;

  /**
   * Present a decision to the player
   * 
   * This function dispatches a PRESENT_DECISION action and triggers
   * a DOM event to ensure UI components are updated.
   * 
   * @param decision - The decision object to present to the player
   */
  const presentPlayerDecision = useCallback((decision: PlayerDecision) => {
    dispatch(presentDecision(decision));
    
    // Force re-render via storage event
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 50);
    
  }, [dispatch]);

  /**
   * Generate a fallback narrative response when AI is unavailable
   * 
   * This provides a simple text response based on the player's choice,
   * ensuring the game can continue even without AI integration.
   * 
   * @param input - Text of the selected option
   * @returns Object with narrative text and item updates
   */
  const generateFallbackNarrative = useCallback((input: string) => {
    return {
      narrative: `You decided: ${input}. The story continues with your choice, the consequences echoing through the dusty streets of Boot Hill.`,
      acquiredItems: [],
      removedItems: []
    };
  }, []);

  /**
   * Record a player's decision and generate a narrative response
   * 
   * This function handles the complete workflow of recording a decision:
   * 1. Validates the decision and option IDs
   * 2. Generates narrative response
   * 3. Creates and stores decision record
   * 4. Updates narrative history
   * 5. Processes decision impacts
   * 6. Clears the current decision state
   * 
   * @param decisionId - ID of the decision being responded to
   * @param selectedOptionId - ID of the option selected by the player
   * @returns Promise that resolves when the decision is fully processed
   */
  const recordPlayerDecision = useCallback(async (
    decisionId: string, 
    selectedOptionId: string
  ): Promise<void> => {
    // Find the decision and selected option
    const decision = state.currentDecision;
    if (!decision || decision.id !== decisionId) {
      throw new Error('Decision not found or does not match current decision');
    }

    const selectedOption = decision.options.find((option) => option.id === selectedOptionId);
    if (!selectedOption) {
      throw new Error('Selected option not found');
    }

    try {
      // Generate narrative response
      const narrativeResponse = generateFallbackNarrative(selectedOption.text);
      
      // Add to narrative history
      dispatch(addNarrativeHistory(narrativeResponse.narrative));
      
      // Create the decision record
      const decisionRecord = createDecisionRecord(
        decision,
        selectedOptionId,
        narrativeResponse.narrative
      );
      
      // Ensure we have a narrativeContext property with decisionHistory array
      if (!state.narrativeContext) {
        // Initialize the narrative context if it doesn't exist
        dispatch(updateNarrativeContext({
          characterFocus: [],
          themes: [],
          worldContext: '',
          importantEvents: [],
          decisionHistory: []
        }));
      }
      
      // Update the decision history in the context
      const updatedHistory = [
        ...(state.narrativeContext?.decisionHistory || []),
        decisionRecord
      ];
      
      dispatch(updateNarrativeContext({
        decisionHistory: updatedHistory
      }));
      
      // Record the decision through the reducer
      dispatch(recordDecision(decisionId, selectedOptionId, narrativeResponse.narrative));
      
      // Process the impacts of this decision
      dispatch(processDecisionImpacts(decisionId));
      
      // Explicitly clear the current decision to fix UI issues
      dispatch(clearCurrentDecision());

      // Force context update to ensure UI updates properly
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 50);

    } catch (error) {
      console.error('Error recording player decision:', error);
      // Make sure to still clear even if there's an error
      dispatch(clearCurrentDecision());
      throw error;
    }
  }, [state.currentDecision, state.narrativeContext, dispatch, generateFallbackNarrative]);

  /**
   * Clear the current decision without recording it
   * 
   * This is useful for abandoning decisions or handling error cases.
   */
  const clearPlayerDecision = useCallback(() => {
    dispatch(clearCurrentDecision());
    
    // Force update to ensure UI components reflect the change
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 50);
  }, [dispatch]);

  /**
   * Get the decision history filtered by tags
   * 
   * This allows for selective retrieval of past decisions based on tags.
   * 
   * @param tags - Optional tags to filter by
   * @returns Array of decision records that match the filter criteria
   */
  const getDecisionHistory = useCallback((tags?: string[]): PlayerDecisionRecord[] => {
    if (!state.narrativeContext?.decisionHistory) {
      return [];
    }

    if (!tags || tags.length === 0) {
      return state.narrativeContext.decisionHistory;
    }

    return state.narrativeContext.decisionHistory.filter((record) => {
      return record.tags.some((tag) => tags!.includes(tag));
    });
  }, [state.narrativeContext?.decisionHistory]);
  
  /**
   * Check if the narrative contains triggers for decisions
   * 
   * This function analyzes narrative text for keywords that might indicate
   * a decision point. In a production implementation, this would use AI
   * to identify appropriate decision points.
   * 
   * @param narrativeText - The current narrative text to analyze
   * @returns Boolean indicating if a decision was triggered
   */
  const checkForDecisionTriggers = useCallback((narrativeText: string) => {
    // For now, just check for some keywords that might indicate a decision point
    // In a real implementation, this would be handled by the AI service
    const keywords = [
      'decide', 'choice', 'choose', 'option', 'what will you do', 
      'what do you do', 'your move', 'your turn'
    ];
    
    const lowerText = narrativeText.toLowerCase();
    const shouldTrigger = keywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    
    if (shouldTrigger && !state.currentDecision) {
      // Create a simple gameplay-triggered decision
      // In a real implementation, this would be generated by the AI
      const testDecision = {
        id: `narrative-decision-${Date.now()}`,
        prompt: 'How do you respond?',
        timestamp: Date.now(),
        options: [
          { 
            id: 'option1', 
            text: 'Cautiously investigate the situation',
            impact: 'You might learn valuable information but could place yourself at risk.'
          },
          { 
            id: 'option2', 
            text: 'Take immediate action',
            impact: 'Bold moves can yield rewards but might have unforeseen consequences.'
          },
          { 
            id: 'option3', 
            text: 'Step back and observe',
            impact: 'Playing it safe lets you gather more information but may mean missing an opportunity.'
          }
        ],
        context: 'The narrative seems to be leading to a decision point...',
        importance: 'moderate' as DecisionImportance,
        characters: ['Player Character'],
        aiGenerated: false
      };
      
      // Present the decision
      presentPlayerDecision(testDecision);
      
      return true;
    }
    
    return false;
  }, [state.currentDecision, presentPlayerDecision]);
  
  /**
   * Trigger an AI-generated decision with specific context
   * 
   * This function creates and presents a decision based on the provided
   * context. In a production implementation, this would generate the decision
   * using the AI service.
   * 
   * @param context - The narrative context for the decision
   * @param importance - Optional importance level for the decision
   * @returns Boolean indicating if the decision was successfully triggered
   */
  const triggerAIDecision = useCallback((context: string, importance: DecisionImportance = 'moderate') => {
    if (state.currentDecision) {
      return false;
    }
    
    // In a real implementation, this would call the AI service
    // For now, create a placeholder decision
    const aiDecision = {
      id: `ai-decision-${Date.now()}`,
      prompt: 'A decision presents itself...',
      timestamp: Date.now(),
      options: [
        { 
          id: 'ai-opt1', 
          text: 'Take the first path',
          impact: 'The first path leads to unknown territory.'
        },
        { 
          id: 'ai-opt2', 
          text: 'Choose the second option',
          impact: 'The second option feels safer but less rewarding.'
        },
        { 
          id: 'ai-opt3', 
          text: 'Try the third approach',
          impact: 'The third approach is risky but potentially more rewarding.'
        }
      ],
      context: context || 'The AI has identified a decision point in the narrative.',
      importance: importance,
      characters: ['Player Character'],
      aiGenerated: true
    };
    
    // Present the decision
    presentPlayerDecision(aiDecision);
    
    return true;
  }, [state.currentDecision, presentPlayerDecision]);

  return {
    // Current decision state
    currentDecision: state.currentDecision,
    
    // Decision history
    decisionHistory: state.narrativeContext?.decisionHistory || [],
    
    // Decision functions
    presentPlayerDecision,
    recordPlayerDecision,
    clearPlayerDecision,
    getDecisionHistory,
    checkForDecisionTriggers,
    triggerAIDecision,
    
    // Decision state checks
    hasActiveDecision: Boolean(state.currentDecision),
  };
}