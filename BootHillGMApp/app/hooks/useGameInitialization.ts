import { useCallback, useEffect, useRef, useState } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import { initialGameState } from '../types/campaign';
import { getAIResponse } from '../utils/aiService';
import { INITIAL_INVENTORY } from '../utils/constants';

// Hook to handle game session initialization and state management
export const useGameInitialization = () => {
  const { state, dispatch, saveGame } = useCampaignState();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const initializationRef = useRef(false);

  // Handle initial client-side setup and cleanup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isNewCharacter = sessionStorage.getItem('initializing_new_character');
      if (isNewCharacter) {
        dispatch({ type: 'SET_STATE', payload: { ...initialGameState, isClient: true } });
      }
    }
    setIsClient(true);

    // Reset initialization state when component unmounts
    return () => {
      initializationRef.current = false;
      setIsInitializing(false);
    };
  }, [dispatch]);

  /**
   * Initializes or restores a game session with AI-generated suggested actions.
   * Handles three scenarios:
   * 1. New character initialization
   * 2. Existing state restoration
   * 3. Continuing an active session
   */
  const initializeGameSession = useCallback(async () => {
    if (!state || !dispatch) return null;

    setIsInitializing(true);

    try {
      const lastCharacterJSON = localStorage.getItem('lastCreatedCharacter');
      const characterData = lastCharacterJSON ? JSON.parse(lastCharacterJSON) : null;

      // New character initialization
      if (sessionStorage.getItem('initializing_new_character')) {
        sessionStorage.removeItem('initializing_new_character');

        // Generate initial narrative and actions considering character background
        const response = await getAIResponse(
          `Initialize a new game session for ${characterData?.name}. 
          Describe their current situation and location in detail.
          Consider the character's background and skills.
          Include suggestions for what they might do next.`,
          '',
          []
        );

        return {
          ...initialGameState,
          character: characterData,
          narrative: response.narrative,
          location: response.location || 'Unknown Location',
          inventory: INITIAL_INVENTORY,
          savedTimestamp: Date.now(),
          isClient: true,
          suggestedActions: response.suggestedActions || []
        };
      }

      // Use existing state if available
      if (state.narrative && state.narrative.length > 0) {
        if (!state.suggestedActions?.length) {
          // If we need to generate new suggestions for existing state
          const response = await getAIResponse(
            `Based on the current situation, what are some actions ${state.character?.name || 'the player'} might take?`,
            state.narrative,
            state.inventory || []
          );

          return {
            ...state,
            suggestedActions: response.suggestedActions || []
          };
        }
        return state;
      }

      // Initialize state for existing character
      const response = await getAIResponse(
        `Initialize a new game session for ${state.character?.name || 'Unknown'}. 
        Provide a detailed introduction to the character's current situation.
        Consider their skills, background, and circumstances.
        Include clear suggestions for what they might do next.
        Ensure to explicitly state their current location.`,
        '',
        state.inventory || []
      );

      return {
        ...state,
        narrative: response.narrative,
        location: response.location || 'Unknown Location',
        inventory: INITIAL_INVENTORY,
        savedTimestamp: Date.now(),
        isClient: true,
        suggestedActions: response.suggestedActions || []
      };

    } catch (error) {
      // Handle errors gracefully with fallback suggestions
      try {
        const fallbackResponse = await getAIResponse(
          'What are some basic actions the player could take right now?',
          state.narrative || '',
          state.inventory || []
        );
        return {
          ...state,
          suggestedActions: fallbackResponse.suggestedActions || []
        };
      } catch {
        return state;
      }
    } finally {
      setIsInitializing(false);
    }
  }, [state, dispatch]);

  // Manage game initialization lifecycle
  useEffect(() => {
    const initGame = async () => {
      if (!isClient || !state || !dispatch) {
        return;
      }

      if (!initializationRef.current || sessionStorage.getItem('initializing_new_character')) {
        initializationRef.current = true;

        const initializedState = await initializeGameSession();
        if (initializedState) {
          dispatch({ type: 'SET_STATE', payload: initializedState });
          saveGame(initializedState);
        }
      }
    };

    // Reset initialization if state is cleared
    if (!state.character) {
      initializationRef.current = false;
    }

    initGame();
  }, [isClient, state, dispatch, saveGame, initializeGameSession]);

  return { isInitializing, isClient };
};
