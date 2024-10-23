import { useState, useEffect, useCallback, useRef } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import { getAIResponse } from '../services/ai';

/**
 * Custom hook to manage game session initialization logic.
 * Handles character loading, game state initialization, and initial inventory setup.
 * Uses refs to prevent multiple initializations and manages client-side state.
 */
export const useGameInitialization = () => {
  const { state, dispatch } = useCampaignState();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  // Track initialization state and prevent double initialization
  const initializationRef = useRef(false);

  /**
   * Initializes a new game session with the following steps:
   * 1. Generates initial narrative and location using AI
   * 2. Sets up starting inventory with basic items
   * 3. Handles error cases with appropriate fallback values
   */

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initializeGameSession = useCallback(async () => {
    if (!state || !dispatch) {
      return;
    }

    setIsInitializing(true);

    try {
      // Generate initial narrative and game state via AI
      const response = await getAIResponse(
        `Initialize a new game session for a character named ${state.character?.name || 'Unknown'}. 
        Provide a brief introduction to the game world and the character's current situation. 
        Include a detailed description of their current location and some potential options for action.
        Ensure to explicitly state the name of the current location.`,
        '',
        []
      );

      // Create complete state update to maintain consistency
      const updatedState = {
        ...state,
        narrative: response.narrative,
        location: response.location || 'Unknown Location',
        inventory: [
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
        ]
      };

      return updatedState;

    } catch (error) {
      console.error('Error initializing game session:', error);
      return {
        ...state,
        narrative: 'An error occurred while starting the game. Please try again.',
        location: 'Unknown Location'
      };
    } finally {
      setIsInitializing(false);
    }
  }, [state, dispatch]);

  return { isInitializing, isClient, initializationRef, initializeGameSession };
};
