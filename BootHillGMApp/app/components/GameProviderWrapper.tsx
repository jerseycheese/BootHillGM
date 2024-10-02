'use client';

import React from 'react';
import { GameProvider } from '../utils/gameEngine';

export function GameProviderWrapper({ children }: { children: React.ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}