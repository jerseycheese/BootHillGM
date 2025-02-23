'use client';

import React, { useEffect, useRef } from 'react';
import { GameProvider, useGame } from '../utils/gameEngine';
import { useCampaignState } from './CampaignStateManager';

function GameStateSync({ children }: { children: React.ReactNode }) {
  const { state: campaignState } = useCampaignState();
  const { dispatch, state: gameState } = useGame();
  const isInitialSync = useRef(true);

  useEffect(() => {
    // Always sync on initial mount
    if (isInitialSync.current) {
      isInitialSync.current = false;
      dispatch({ type: 'SET_STATE', payload: campaignState });
      return;
    }

    // After initial sync, only sync if timestamps differ and we're not initializing
    const isInitializing = sessionStorage.getItem('initializing_new_character');
    if (!isInitializing && campaignState.savedTimestamp !== gameState.savedTimestamp) {
      dispatch({ type: 'SET_STATE', payload: campaignState });
    }
  }, [
    campaignState,
    campaignState.savedTimestamp,
    gameState.savedTimestamp,
    dispatch,
  ]);

  return <>{children}</>;
}

export function GameProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      <GameStateSync>{children}</GameStateSync>
    </GameProvider>
  );
}
