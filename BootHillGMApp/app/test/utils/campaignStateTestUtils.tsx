/**
 * Campaign State Test Utilities
 * 
 * Provides consistent utilities for testing components that use CampaignStateProvider
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import CampaignStateProvider from '../../components/CampaignStateProvider';
import { GameState, initialGameState } from '../../types/gameState';
import { createMockFn } from './mockUtils';
import { NarrativeProvider } from '../../context/NarrativeContext';
import { MockNarrativeProvider } from './narrativeProviderMock';

/**
 * Props for test wrappers
 */
interface TestProviderProps {
  children: React.ReactNode;
  initialState?: Partial<GameState>;
}

/**
 * Basic test wrapper with CampaignStateProvider
 */
export const CampaignStateTestWrapper: React.FC<TestProviderProps> = ({ 
  children, 
  initialState 
}) => {
  return (
    <CampaignStateProvider initialState={initialState ? {...initialGameState, ...initialState} : undefined}>
      {children}
    </CampaignStateProvider>
  );
};

/**
 * Test wrapper with CampaignStateProvider and NarrativeProvider
 */
export const FullTestWrapper: React.FC<TestProviderProps> = ({ 
  children, 
  initialState 
}) => {
  return (
    <CampaignStateProvider initialState={initialState ? {...initialGameState, ...initialState} : undefined}>
      <MockNarrativeProvider>
        {children}
      </MockNarrativeProvider>
    </CampaignStateProvider>
  );
};

/**
 * Render component with CampaignStateProvider
 */
export const renderWithCampaignState = (
  ui: React.ReactElement,
  initialState?: Partial<GameState>,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: props => (
      <CampaignStateTestWrapper initialState={initialState} {...props} />
    ),
    ...options
  });
};

/**
 * Render component with full providers (Campaign State and Narrative)
 */
export const renderWithFullProviders = (
  ui: React.ReactElement,
  initialState?: Partial<GameState>,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: props => (
      <FullTestWrapper initialState={initialState} {...props} />
    ),
    ...options
  });
};
