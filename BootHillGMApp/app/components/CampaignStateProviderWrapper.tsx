/**
 * CampaignStateProviderWrapper
 * 
 * This is a wrapper component that provides the CampaignStateManager
 * functionality with a simplified API for backward compatibility.
 */

import React from 'react';
import { CampaignStateManager } from './CampaignStateManager';

// Re-export for compatibility
export const CampaignStateProvider = CampaignStateManager;

/**
 * Wrapper component that simplifies usage for legacy components
 */
export const CampaignStateProviderWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <CampaignStateManager>{children}</CampaignStateManager>;
};

export default CampaignStateProviderWrapper;
