import { useContext, useCallback, useState, useMemo } from 'react';
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
// Import from barrel file to avoid case-sensitivity issues
import { AIService } from '../services/ai';
import { EVENTS, triggerCustomEvent } from '../utils/events';
import { InventoryItem } from '../types/item.types';

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
  // Keep track of AI request state
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  
  // Instance of the AI service - wrapped in useMemo to prevent recreation on every render
  const aiService = useMemo(() => new AIService(), []);
  
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
    
    // Trigger custom event for more reliable UI updates
    triggerCustomEvent(EVENTS.DECISION_READY, decision);
    
    // Force re-render via storage event (legacy support)
    window.dispatchEvent(new Event('storage'));
    
  }, [dispatch]);

  /**
   * Generate a narrative response based on the player's choice
   * 
   * This function uses the AI service to generate a contextual response
   * to the player's decision, or falls back to a simpler response if
   * AI generation fails.
   * 
   * @param option - The selected decision option text
   * @param decisionPrompt - The original decision prompt
   * @returns Object with narrative text and item updates
   */
  const generateNarrativeResponse = useCallback(async (
    option: string,
    decisionPrompt: string
  ) => {
    setIsGeneratingNarrative(true);
    
    try {
      // Use recent narrative history as context
      const recentHistory = state.narrativeHistory.slice(-3).join('\n\n');
      
      // Get player inventory from game state - as an array of InventoryItem objects
      const inventory: InventoryItem[] = []; // In a real implementation, get this from game state
      
      // Create a prompt that includes the decision context and selected option
      const prompt = `In response to "${decisionPrompt}", I chose to "${option}". What happens next?`;
      
      // Get AI response with narrative continuation
      const response = await aiService.getAIResponse(prompt, recentHistory, inventory);
      
      setIsGeneratingNarrative(false);
      return {
        narrative: response.narrative,
        acquiredItems: response.acquiredItems || [],
        removedItems: response.removedItems || []
      };
    } catch (error) {
      console.error('Error generating AI narrative response:', error);
      setIsGeneratingNarrative(false);
      
      // Fall back to a basic response that explicitly mentions the player's choice
      const fallbackResponse = `The story continues as you ${option.toLowerCase()}. Your choice leads to new developments in the western town of Redemption. The locals take note of your actions as you continue your journey.`;
      
      return {
        narrative: fallbackResponse,
        acquiredItems: [],
        removedItems: []
      };
    }
  }, [state.narrativeHistory, aiService]);

  /**
   * Record a player's decision and generate a narrative response
   * 
   * This function handles the complete workflow of recording a decision:
   * 1. Validates the decision and option IDs
   * 2. Generates narrative response via AI
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
      const errorMsg = 'Decision not found or does not match current decision';
      throw new Error(errorMsg);
    }

    const selectedOption = decision.options.find((option) => option.id === selectedOptionId);
    if (!selectedOption) {
      const errorMsg = 'Selected option not found';
      throw new Error(errorMsg);
    }

    try {
      // First set the generation state to true - this will show our loading UI
      setIsGeneratingNarrative(true);
      
      // Show a temporary loading message in the narrative
      dispatch(addNarrativeHistory("...\n"));
      
      // Generate narrative response based on the player's choice
      const narrativeResponse = await generateNarrativeResponse(
        selectedOption.text,
        decision.prompt
      );
      
      // Create an explicit player decision narrative - make sure it starts with "Player:" for correct parsing
      const playerActionText = `${selectedOption.text.toLowerCase()}`;
      const playerChoiceNarrative = `Player: ${playerActionText}`;
      
      // Now that we have the response, we can clear the decision
      dispatch(clearCurrentDecision());
      triggerCustomEvent(EVENTS.DECISION_CLEARED);
      
      // Update the temporary message with the actual response
      // First, remove the temporary loading message
      const narrativeHistory = [...state.narrativeHistory];
      narrativeHistory.pop(); // Remove the loading message
      
      dispatch({
        type: 'UPDATE_NARRATIVE',
        payload: {
          narrativeHistory: narrativeHistory
        }
      });
      
      // First, add the player's choice explicitly
      dispatch(addNarrativeHistory(playerChoiceNarrative));
      
      // Then add the AI narrative response as a Game Master response
      dispatch(addNarrativeHistory(`Game Master: ${narrativeResponse.narrative}`));
      
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

      // Force context update to ensure UI updates properly
      triggerCustomEvent(EVENTS.UI_FORCE_UPDATE);
      window.dispatchEvent(new Event('storage'));
      
      // Final cleanup of state
      setIsGeneratingNarrative(false);

    } catch (error) {
      console.error('Error recording player decision:', error);
      // Make sure to still clear even if there's an error
      dispatch(clearCurrentDecision());
      setIsGeneratingNarrative(false);
      throw error;
    }
  }, [state.currentDecision, state.narrativeContext, state.narrativeHistory, dispatch, generateNarrativeResponse]);

  /**
   * Clear the current decision without recording it
   * 
   * This is useful for abandoning decisions or handling error cases.
   */
  const clearPlayerDecision = useCallback(() => {
    dispatch(clearCurrentDecision());
    
    // Trigger custom event for more reliable UI updates
    triggerCustomEvent(EVENTS.DECISION_CLEARED);
    
    // Force update to ensure UI components reflect the change
    triggerCustomEvent(EVENTS.UI_FORCE_UPDATE);
    window.dispatchEvent(new Event('storage'));
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
    isGeneratingNarrative,
  };
}