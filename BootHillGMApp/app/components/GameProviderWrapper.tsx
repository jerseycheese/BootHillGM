'use client';

/**
 * Wrapper component for GameProvider to ensure state is properly initialized
 */
import React from 'react';
// Import the correct provider from the context directory
import { GameStateProvider } from '../context/GameStateProvider';
// Removed unused imports
// import { _useEffect } from 'react';
// import { _GameState } from '../types/gameState';
// import { _initialNarrativeState } from '../types/narrative.types';
// import { _FixStatus } from 'some-module-path';

/**
 * Wrapper component for GameProvider with initialization check
 */
export const GameProviderWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Use the correct provider
  return (
    <GameStateProvider>
      {children}
    </GameStateProvider>
  );
};

export default GameProviderWrapper;
