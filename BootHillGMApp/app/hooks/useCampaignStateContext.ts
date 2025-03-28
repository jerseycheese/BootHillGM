import { createContext, useContext } from 'react';
import { CampaignStateContextType } from '../types/campaignState.types';

/**
 * Context for managing and accessing campaign state throughout the application.
 * Must be used with a CampaignStateProvider to provide values.
 */
export const CampaignStateContext = createContext<CampaignStateContextType | undefined>(undefined);

/**
 * Hook for consuming the campaign state context.
 * Provides access to game state, dispatch, and utility functions.
 * @throws {Error} If used outside of a CampaignStateProvider
 * @returns {CampaignStateContextType} The campaign state context value
 */
export const useCampaignState = () => {
  const context = useContext(CampaignStateContext);
  if (context === undefined) {
    throw new Error('useCampaignState must be used within a CampaignStateProvider');
  }
  return context;
};
