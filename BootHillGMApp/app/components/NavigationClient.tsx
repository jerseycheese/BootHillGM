'use client';

import { useEffect } from 'react';
// Removed import { useCampaignState } from './CampaignStateManager';
// Removed import { useGame } from '../hooks/useGame';
import { useGameState } from '../context/GameStateProvider'; // Import correct hook
import { debugStorage } from '../utils/debugHelpers';

export default function NavigationClient() {
  // Removed useCampaignState call
  // const { loadGame } = useCampaignState();
  // Use the correct state hook
  const { state, dispatch } = useGameState();

  useEffect(() => {
    debugStorage();

    // Removed explicit loadGame call. Initialization is handled by useGameInitialization/useGameSession.
    // if (!state.character) {
    //   const loadedState = loadGame(); // loadGame is not available here directly
    //   if (loadedState) {
    //     dispatch({ type: 'SET_STATE', payload: loadedState });
    //   }
    // }
  }, [state.character, dispatch]); // Removed loadGame from dependencies

  return null; // This component doesn't render anything
}
