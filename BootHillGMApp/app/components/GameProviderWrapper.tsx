'use client';

import React, { useEffect } from 'react';
import { GameProvider, useGame } from '../utils/gameEngine';
import { useCampaignState } from './CampaignStateManager';

function GameStateSync({ children }: { children: React.ReactNode }) {
  const { state: campaignState } = useCampaignState();
  const { dispatch } = useGame();

  useEffect(() => {
    // Sync campaign state to game state
    dispatch({ type: 'SET_STATE', payload: campaignState });
  }, [campaignState, dispatch]);

  return <>{children}</>;
}

export function GameProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      <GameStateSync>
        {children}
      </GameStateSync>
    </GameProvider>
  );
}
