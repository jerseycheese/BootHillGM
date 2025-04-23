'use client';

import { useEffect } from 'react';
import { useGameState } from '../context/GameStateProvider';
import { debugStorage } from '../utils/debugHelpers';

export default function NavigationClient() {
  // Use the correct state hook
  const { state, dispatch } = useGameState();

  useEffect(() => {
    debugStorage();

  }, [state.character, dispatch]);

  return null; // This component doesn't render anything
}
