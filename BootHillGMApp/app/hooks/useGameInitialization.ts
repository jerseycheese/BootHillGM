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

  // Initialize a new game session or restore existing one
  const initializeGameSession = useCallback(async () => {
    if (!state || !dispatch) return null;

    setIsInitializing(true);

    try {
      const lastCharacterJSON = localStorage.getItem('lastCreatedCharacter');
      const characterData = lastCharacterJSON ? JSON.parse(lastCharacterJSON) : null;

      // Handle new character initialization
      if (sessionStorage.getItem('initializing_new_character')) {
        sessionStorage.removeItem('initializing_new_character');

        const response = await getAIResponse(
          `Initialize a new game session for ${characterData?.name}. Describe their current situation and location.`,
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
          isClient: true
        };
      }

      // Use existing state if available
      if (state.narrative && state.narrative.length > 0) {
        return state;
      }

      // Initialize state for existing character
      const response = await getAIResponse(
        `Initialize a new game session for ${state.character?.name || 'Unknown'}. 
        Provide a brief introduction to the game world and the character's current situation. 
        Include a detailed description of their current location and some potential options for action.
        Ensure to explicitly state the name of the current location.`,
        '',
        []
      );

      return {
        ...state,
        narrative: response.narrative,
        location: response.location || 'Unknown Location',
        inventory: INITIAL_INVENTORY,
        savedTimestamp: Date.now(),
        isClient: true
      };

    } catch (error) {
      console.error('Error in initializeGameSession:', error);
      return state;
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
