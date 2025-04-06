import { useState, useEffect } from 'react';
import { useGameState } from '../context/GameStateProvider';
import { GameStorage } from '../utils/gameStorage';
import { getAIResponse } from '../services/ai/gameService'; // Import gameService
import { generateNarrativeSummary } from '../utils/ai/narrativeSummary'; // Re-import summary generator
import { NarrativeJournalEntry } from '../types/journal';
import { SuggestedAction } from '../types/campaign'; // Import SuggestedAction type

/**
 * useGameInitialization hook
 * 
 * Handles the initialization of the game state from storage or initializes a new game
 * if no saved state is found.
 * 
 * Returns:
 * - isInitializing: true if the game is still loading state, false when ready
 * - isClient: true if running in a browser, false during SSR
 */
export function useGameInitialization() {
  // Get state and dispatch from the game state context
  const { state: _state, dispatch } = useGameState(); // Use _state to indicate it's unused for now
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Client-side check
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only initialize on the client side
    if (!isClient) return;
    
    const initializeState = async () => {
      try {
        // Load the saved game state if it exists
        const savedState = localStorage.getItem(GameStorage.keys.GAME_STATE);
        
        // Get the default character first so we can use it throughout
        const defaultCharacter = GameStorage.getDefaultCharacter();
        
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          
          // Dispatch the saved state
          dispatch({ type: 'SET_STATE', payload: parsedState });
        } else {
          // Initialize a new game if no saved state exists
          const initialState = GameStorage.initializeNewGame();
          
          // Ensure character exists and has a proper name - IMPORTANT!
          
          // Important: Set the default character BEFORE setting the rest of the state
          // This ensures the character name is properly set first
          dispatch({ 
            type: 'character/SET_CHARACTER',
            payload: defaultCharacter
          });
          
          // Set the rest of the game state
          dispatch({ type: 'SET_STATE', payload: initialState });
          
          // Get default inventory items
          const defaultItems = GameStorage.getDefaultInventoryItems();
          
          // CRITICAL: This needs to be set directly to inventory/SET_INVENTORY
          // not just SET_INVENTORY to ensure proper action handling
          dispatch({
            type: 'inventory/SET_INVENTORY',
            payload: defaultItems
          });
          
          
          // Check if inventory was set correctly by dispatching a direct action
          for (const item of defaultItems) {
            dispatch({
              type: 'inventory/ADD_ITEM',
              payload: item
            });
          }
          // --- Generate Initial Narrative & Actions via AI ---
          try {
            const initialAIResponse = await getAIResponse({
              prompt: "Begin the adventure in Boot Hill",
              journalContext: "The player character has just arrived in the frontier town of Boot Hill.",
              inventory: defaultItems,
              // No story progression, narrative context, or lore store initially
            });

            // Create and dispatch initial narrative entry
            if (initialAIResponse.narrative) {
              let summary = 'Arrived in Boot Hill.'; // Default fallback summary
              try {
                // Attempt to generate summary from the AI narrative content
                summary = await generateNarrativeSummary(
                  "Summarize the start of the adventure", // Context for summary generation
                  initialAIResponse.narrative
                );
              } catch (summaryError) {
                console.error("Failed to generate narrative summary:", summaryError);
                // Keep the default fallback summary if generation fails
              }

              const initialNarrativeEntry: NarrativeJournalEntry = {
                id: `entry_narrative_${Date.now()}`,
                title: 'Adventure Begins',
                type: 'narrative',
                timestamp: Date.now(),
                content: initialAIResponse.narrative, // Use AI narrative
                narrativeSummary: summary // Use generated summary or fallback
              };
              dispatch({
                type: 'journal/ADD_ENTRY',
                payload: initialNarrativeEntry
              });
            } else {
               console.warn("AI response missing narrative content.");
            }

            // Dispatch suggested actions
            if (initialAIResponse.suggestedActions && initialAIResponse.suggestedActions.length > 0) {
               // Ensure payload matches expected type for the reducer
               const actionsPayload: SuggestedAction[] = initialAIResponse.suggestedActions.map(action => ({
                 id: action.id || `action-${Date.now()}-${Math.random()}`, // Ensure ID exists
                 title: action.title || 'Unnamed Action',
                 description: action.description || '',
                 type: action.type || 'optional' // Ensure type exists and is valid
               }));

              dispatch({
                type: 'SET_SUGGESTED_ACTIONS', // Use the correct action type
                payload: actionsPayload
              });
            } else {
               console.warn("AI response missing suggested actions.");
            }

          } catch (aiError) {
            // console.error("Failed to get initial AI response:", aiError); // Keep error log for production issues
            // Fallback: Add a simple default narrative entry if AI fails
            const fallbackNarrativeEntry: NarrativeJournalEntry = {
              id: `entry_narrative_fallback_${Date.now()}`,
              title: 'Adventure Begins (Fallback)',
              type: 'narrative',
              timestamp: Date.now(),
              content: 'Your adventure begins in the rugged frontier town of Boot Hill. The AI game master seems to be unavailable.',
              narrativeSummary: 'Arrived in Boot Hill, AI unavailable.'
            };
            dispatch({
              type: 'journal/ADD_ENTRY',
              payload: fallbackNarrativeEntry
            });
             // Optionally dispatch default suggested actions as fallback?
             // dispatch({ type: 'SET_SUGGESTED_ACTIONS', payload: [...] });
          }
          // --- End AI Generation ---

        } // End of else block (!savedState)
        
        
        // After all state has been set, set character one more time to ensure it sticks
        dispatch({ 
          type: 'character/SET_CHARACTER',
          payload: defaultCharacter
        });
        
        // Finish initialization
        setIsInitializing(false);
      } catch { // Remove unused error variable
        setIsInitializing(false);
      }
    };

    // Run initialization
    initializeState();
  }, [isClient, dispatch]);

  return { isInitializing, isClient };
}