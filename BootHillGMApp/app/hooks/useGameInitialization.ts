import { useCallback, useEffect, useRef, useState } from 'react';
import { useCampaignState } from '../components/CampaignStateManager';
import { initialGameState } from '../types/campaign';
import { getAIResponse } from '../utils/aiService';
import { INITIAL_INVENTORY } from '../utils/constants';

export const useGameInitialization = () => {
  const { state, dispatch, saveGame } = useCampaignState();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const initializationRef = useRef(false);

  // Add immediate cleanup check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isNewCharacter = sessionStorage.getItem('initializing_new_character');
      if (isNewCharacter) {
        dispatch({ type: 'SET_STATE', payload: { ...initialGameState, isClient: true } });
      }
    }
    setIsClient(true);
  }, [dispatch]);

  const initializeGameSession = useCallback(async () => {
    if (!state || !dispatch) return null;

    setIsInitializing(true);

    try {
      // Get last created character
      const lastCharacterJSON = localStorage.getItem('lastCreatedCharacter');
      const characterData = lastCharacterJSON ? JSON.parse(lastCharacterJSON) : null;

      // Always initialize new session if initialization flag is set
      if (sessionStorage.getItem('initializing_new_character')) {
        sessionStorage.removeItem('initializing_new_character');

        const response = await getAIResponse(
          `Initialize a new game session for ${characterData?.name}. Describe their current situation and location.`,
          '',
          []
        );

        const freshState = {
          ...initialGameState,
          character: characterData,
          narrative: response.narrative,
          location: response.location || 'Unknown Location',
          inventory: INITIAL_INVENTORY,
          savedTimestamp: Date.now(),
          isClient: true
        };
        return freshState;
      }

      // If we have existing state with narrative, use it
      if (state.narrative && state.narrative.length > 0) {
        return state;
      }

      const response = await getAIResponse(
        `Initialize a new game session for ${state.character?.name || 'Unknown'}. 
        Provide a brief introduction to the game world and the character's current situation. 
        Include a detailed description of their current location and some potential options for action.
        Ensure to explicitly state the name of the current location.`,
        '',
        []
      );

      const initializedState = {
        ...state,
        narrative: response.narrative,
        location: response.location || 'Unknown Location',
        inventory: INITIAL_INVENTORY,
        savedTimestamp: Date.now(),
        isClient: true
      };

      return initializedState;

    } catch (error) {
      console.error('Error in initializeGameSession:', error);
      return state;
    } finally {
      setIsInitializing(false);
    }
  }, [state, dispatch]);

  useEffect(() => {
    const initGame = async () => {
      if (!isClient || !state || !dispatch) {
        return;
      }

      // Add extra check for initialization flag
      if (!initializationRef.current || sessionStorage.getItem('initializing_new_character')) {
        initializationRef.current = true;

        const initializedState = await initializeGameSession();
        if (initializedState) {
          dispatch({ type: 'SET_STATE', payload: initializedState });
          saveGame(initializedState);
        }
      }
    };

    initGame();
  }, [isClient, state, dispatch, saveGame, initializeGameSession]);

  return { isInitializing, isClient };
};
