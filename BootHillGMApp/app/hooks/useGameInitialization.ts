import { useState, useEffect } from 'react';
import { useGameState } from '../context/GameStateProvider';
import { GameStorage } from '../utils/gameStorage';
import { generateNarrativeSummary } from '../utils/ai/narrativeSummary';
import { NarrativeJournalEntry } from '../types/journal';

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
        }
        
        // Add initial narrative entry for game start if no journal entries exist
        // Create the initial narrative content
        const initialNarrativeContent = 'Your adventure begins in the rugged frontier town of Boot Hill. The air is thick with dust and tension, as you stand ready to write your own legend in this untamed land.';
        
        try {
          // Generate a summary using the AI model
          const narrativeSummary = await generateNarrativeSummary(
            "begin adventure", 
            initialNarrativeContent
          );
          
          
          // Create the journal entry with the AI-generated summary
          const initialNarrativeEntry: NarrativeJournalEntry = {
            id: `entry_narrative_${Date.now()}`,
            title: 'Adventure Begins', // Add title
            type: 'narrative',
            timestamp: Date.now(),
            content: initialNarrativeContent,
            narrativeSummary: narrativeSummary
          };
          
          dispatch({
            type: 'journal/ADD_ENTRY',
            payload: initialNarrativeEntry
          });
          } catch { // Remove unused error variable
            
          
          // Fallback to a simple summary if AI generation fails
          const initialNarrativeEntry: NarrativeJournalEntry = {
            id: `entry_narrative_${Date.now()}`,
            title: 'Adventure Begins', // Add title
            type: 'narrative',
            timestamp: Date.now(),
            content: initialNarrativeContent,
            narrativeSummary: 'Arrived in Boot Hill to begin your adventure'
          };
          
          dispatch({
            type: 'journal/ADD_ENTRY',
            payload: initialNarrativeEntry
          });
          
        }
        
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