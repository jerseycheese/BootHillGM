import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Define a simple fallback provider component
const FallbackProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Create placeholder providers that will be used regardless of whether the actual providers exist
let NarrativeProvider = FallbackProvider;
let CampaignStateProvider = FallbackProvider;

// Add an ESLint exception comment for the dynamic import
// This tells ESLint to ignore the next line specifically for this rule
// eslint-disable-next-line @typescript-eslint/no-require-imports
const getNarrativeProvider = () => {
  try {
    // Use a function to isolate the require call and catch errors locally
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NarrativeContext = require('@/app/context/NarrativeContext');
    return NarrativeContext?.NarrativeProvider || FallbackProvider;
  } catch {
    // No need to capture error variable
    console.warn('NarrativeProvider not found, using fallback');
    return FallbackProvider;
  }
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const getCampaignStateProvider = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const CampaignState = require('@/app/context/CampaignStateContext');
    return CampaignState?.CampaignStateProvider || FallbackProvider;
  } catch {
    // No need to capture error variable
    console.warn('CampaignStateProvider not found, using fallback');
    return FallbackProvider;
  }
};

// Try to assign the providers
try {
  NarrativeProvider = getNarrativeProvider();
  CampaignStateProvider = getCampaignStateProvider();
} catch {
  // Fallback is already set as default
}

// Create a custom renderer with all context providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <CampaignStateProvider>
        <NarrativeProvider>
          {children}
        </NarrativeProvider>
      </CampaignStateProvider>
    ),
    ...options,
  });
}

// Create a renderer with specific providers
export function renderWithNarrativeContext(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <NarrativeProvider>
        {children}
      </NarrativeProvider>
    ),
    ...options,
  });
}
