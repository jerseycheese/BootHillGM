import { useContext, useCallback, useState, useMemo, useEffect } from 'react';
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
} from '../actions/narrativeActions';
// Import from barrel file to avoid case-sensitivity issues
import { AIService } from '../services/ai';
import { EVENTS, triggerCustomEvent } from '../utils/events';
import { InventoryItem } from '../types/item.types';
import { createDecisionRecord } from '../utils/decisionUtils';
import { GameState } from '../types/gameState';

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
   * Helper function to ensure narrative state is fresh before generating decisions
   * 
   * This function handles the state update to force a refresh before
   * decision generation to fix the stale context issue (#210).
   */
  const ensureFreshState = useCallback(async () => {
    // Force a state update to ensure we have the freshest state
    // Instead of using lastRefreshed which isn't in the type,
    // we can simply use an empty object to trigger the update
    dispatch({
      type: 'UPDATE_NARRATIVE',
      payload: {}  // Empty object is valid and will trigger a state update
    });

    // Wait a small delay to ensure state has updated
    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), 50);
    });

    // Return the current state after refresh
    return state;
  }, [state, dispatch]);

  /**
   * Trigger an AI-generated decision with specific context
   * 
   * This function uses the enhanced decision generator to create a contextually
   * appropriate decision based on the most recent narrative state.
   * 
   * @param context - Additional narrative context (optional)
   * @param importance - Optional importance level for the decision
   * @returns Boolean indicating if the decision was successfully triggered
   */
  const triggerAIDecision = useCallback(async (context?: string, importance: DecisionImportance = 'moderate') => {
    if (state.currentDecision) {
      return false;
    }
    
    try {
      // First, ensure we have fresh state (fix for issue #210)
      await ensureFreshState();
      
      // Import the enhanced decision generator - dynamic import to avoid circular dependencies
      const { generateEnhancedDecision, setDecisionGenerationMode } = await import('../utils/contextualDecisionGenerator.enhanced');
      
      // Force AI mode to ensure context awareness
      setDecisionGenerationMode('ai');
      
      // Create a complete GameState object to satisfy the type requirements
      const gameState: GameState = {
        currentPlayer: 'player',
        npcs: [],
        location: null,
        inventory: [],
        quests: [],
        character: { 
          id: 'player',
          name: 'Player Character',
          isNPC: false,
          isPlayer: true,
          inventory: [],
          attributes: {
            speed: 5,
            gunAccuracy: 5,
            throwingAccuracy: 5,
            strength: 5,
            baseStrength: 5,
            bravery: 5,
            experience: 0
          },
          minAttributes: {
            speed: 1,
            gunAccuracy: 1,
            throwingAccuracy: 1,
            strength: 1,
            baseStrength: 1,
            bravery: 1,
            experience: 0
          },
          maxAttributes: {
            speed: 10,
            gunAccuracy: 10,
            throwingAccuracy: 10,
            strength: 10,
            baseStrength: 10,
            bravery: 10,
            experience: 100
          },
          wounds: [],
          isUnconscious: false
        },
        narrative: state,
        gameProgress: 0,
        journal: [],
        isCombatActive: false,
        opponent: null,
        isClient: true,
        suggestedActions: [],
        // Add the player getter to satisfy the type requirement
        get player() {
          return this.character;
        }
      };
      
      // If additional context was provided, add it to the narrative
      if (context) {
        // Add the context to the narrative history for better context awareness
        dispatch(addNarrativeHistory(`Game Master: ${context}`));
        
        // Refresh state again after adding context
        await ensureFreshState();
      }
      
      // Generate a decision using the enhanced generator with most current state
      console.debug('Generating decision with fresh narrative state', { 
        historyLength: state.narrativeHistory.length 
      });
      
      const decision = await generateEnhancedDecision(
        gameState,
        state.narrativeContext,
        undefined, // Let the generator determine location from state
        true // Force generation
      );
      
      // If we got a decision, present it
      if (decision) {
        console.debug('Decision generated successfully', { 
          id: decision.id,
          prompt: decision.prompt
        });
        presentPlayerDecision(decision);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error generating AI decision:', error);
      
      // Fallback to a template decision if AI generation fails
      const fallbackDecision = {
        id: `fallback-decision-${Date.now()}`,
        prompt: 'What would you like to do next?',
        timestamp: Date.now(),
        options: [
          { 
            id: `fallback-opt1-${Date.now()}`, 
            text: 'Continue exploring',
            impact: 'You may discover more about your surroundings.'
          },
          { 
            id: `fallback-opt2-${Date.now()}`, 
            text: 'Take a more cautious approach',
            impact: 'Being careful might reveal hidden dangers or opportunities.'
          },
          { 
            id: `fallback-opt3-${Date.now()}`, 
            text: 'Search for clues',
            impact: 'You might find something important to your quest.'
          }
        ],
        context: context || 'Continuing your adventure...',
        importance: importance,
        characters: [],
        aiGenerated: true
      };
      
      presentPlayerDecision(fallbackDecision);
      return true;
    }
  }, [state, dispatch, presentPlayerDecision, ensureFreshState]);

  // When component is loaded, verify that generateNarrativeResponse is properly set up
  // This helps diagnose issues with narrative responses not being added
  useEffect(() => {
    // Create a debug flag to indicate if narrative generation is working
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      window.__debugNarrativeGeneration = {
        generateNarrativeResponse,
        addNarrativeHistory: (text: string) => dispatch(addNarrativeHistory(text))
      };
      
      console.debug('Narrative generation debug helpers attached to window.__debugNarrativeGeneration');
    }
  }, [generateNarrativeResponse, dispatch]);

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
    ensureFreshState,
    
    // Decision state checks
    hasActiveDecision: Boolean(state.currentDecision),
    isGeneratingNarrative,
  };
}