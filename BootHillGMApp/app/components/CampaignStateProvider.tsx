/**
 * Campaign State Provider Component
 * 
 * Simplified version of CampaignStateManager that can be used directly in tests
 * and components without the function children pattern.
 */

'use client';

import React, { ReactNode } from 'react';
import { CampaignStateContext } from '../hooks/useCampaignStateContext';
import { GameState, initialGameState } from '../types/gameState';
import { CampaignStateContextType } from '../types/campaignState.types';
import { createMockFn } from '../test/utils/mockUtils';

// Create browser-compatible mock function implementation
const mockFn = typeof jest !== 'undefined' ? jest.fn : createMockFn;

interface CampaignStateProviderProps {
  children: ReactNode;
  initialState?: GameState;
}

/**
 * Campaign State Provider
 * 
 * A wrapper component that provides the CampaignStateContext to its children.
 * This is a simplified version of CampaignStateManager for use in tests
 * and components that don't need the function children pattern.
 */
export const CampaignStateProvider: React.FC<CampaignStateProviderProps> = ({
  children,
  initialState = initialGameState
}) => {
  // Create a mock dispatch function
  const dispatch = mockFn();
  
  // Create context value with derived state properties
  const contextValue: CampaignStateContextType = {
    state: initialState,
    dispatch,
    saveGame: mockFn(),
    loadGame: mockFn(),
    cleanupState: mockFn(),
    
    // Derived state accessors
    player: initialState.character?.player || null,
    opponent: initialState.character?.opponent || null,
    inventory: initialState.inventory?.items || [],
    entries: initialState.journal?.entries || [],
    isCombatActive: initialState.combat?.isActive || false,
    narrativeContext: initialState.narrative?.narrativeContext
  };
  
  return (
    <CampaignStateContext.Provider value={contextValue}>
      {children}
    </CampaignStateContext.Provider>
  );
};

export default CampaignStateProvider;