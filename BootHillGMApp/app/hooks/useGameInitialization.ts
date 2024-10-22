import { useState, useEffect, useCallback, useRef } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import AIService from '../services/AIService';

/**
 * Custom hook to manage game session initialization logic.
 * Handles character loading, game state initialization, and initial inventory setup.
 * Uses refs to prevent multiple initializations and manages client-side state.
 */
export const useGameInitialization = () => {
  const { state, dispatch } = useCampaignState();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const initializationRef = useRef(false);

  /**
   * Initializes a new game session with the following steps:
   * 1. Generates initial narrative and location using AI
   * 2. Sets up starting inventory with basic items
   * 3. Handles error cases with appropriate fallback values
   */
  const initializeGameSession = useCallback(async () => {
    console.log('Initializing game session');
    if (!state || !dispatch) {
      console.log('State or dispatch is undefined, cannot initialize game session');
      return;
    }
    setIsInitializing(true);
    try {
      const { narrative: initialNarrative, location } = await AIService.getAIResponse(
        `Initialize a new game session for a character named ${state.character?.name || 'Unknown'}. 
        Provide a brief introduction to the game world and the character's current situation. 
        Include a detailed description of their current location and some potential options for action.
        Ensure to explicitly state the name of the current location.`,
        '',
        state.inventory || []
      );
      console.log('Dispatching SET_NARRATIVE action');
      dispatch({ type: 'SET_NARRATIVE', payload: initialNarrative });
      console.log('Dispatching SET_LOCATION action');
      dispatch({ type: 'SET_LOCATION', payload: location || 'Unknown Location' });

      const initialItems = [
        { 
          id: 'health-potion-initial', 
          name: 'Health Potion', 
          quantity: 2, 
          description: 'Restores 20 health points' 
        },
        { 
          id: 'rope-initial', 
          name: 'Rope', 
          quantity: 1, 
          description: 'A sturdy rope, 50 feet long' 
        }
      ];

      initialItems.forEach(item => {
        const existingItem = state.inventory?.find(invItem => invItem.id === item.id);
        if (!existingItem) {
          console.log(`Dispatching ADD_ITEM action for ${item.name}`);
          dispatch({ type: 'ADD_ITEM', payload: item });
        }
      });

    } catch (error) {
      console.error('Error in initializeGameSession:', error);
      dispatch({ type: 'SET_NARRATIVE', payload: 'An error occurred while starting the game. Please try again.' });
      dispatch({ type: 'SET_LOCATION', payload: 'Unknown Location' });
    } finally {
      setIsInitializing(false);
    }
  }, [state, dispatch]);

  // Effect to handle client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  return { isInitializing, isClient, initializationRef, initializeGameSession };
};
