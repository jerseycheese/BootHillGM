'use client';

import { useEffect } from 'react';
import { useCampaignState } from './CampaignStateManager';
import { useGame } from '../hooks/useGame';
import { debugStorage } from '../utils/debugHelpers';

export default function NavigationClient() {
  const { loadGame } = useCampaignState();
  const { state, dispatch } = useGame();

  useEffect(() => {
    debugStorage();

    // Load game state if no character is present
    if (!state.character) {
      const loadedState = loadGame();
      if (loadedState) {
        dispatch({ type: 'SET_STATE', payload: loadedState });
      }
    }
  }, [state.character, loadGame, dispatch]);

  return null; // This component doesn't render anything
}
