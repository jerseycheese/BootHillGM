'use client';

import React from 'react';
import { CampaignStateProvider } from './CampaignStateManager';

/**
 * This is a wrapper component that provides the CampaignStateProvider
 * with all the required types.
 */
const CampaignStateProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CampaignStateProvider>
      {children}
    </CampaignStateProvider>
  );
};

export default CampaignStateProviderWrapper;
