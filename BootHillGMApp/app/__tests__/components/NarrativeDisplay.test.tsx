import React from 'react';
import { render, screen } from '@testing-library/react';
import { NarrativeDisplay, NarrativeItem } from '../../components/NarrativeDisplay';
import { NarrativeContent } from '../../components/NarrativeContent';
import CampaignStateProvider from '../../components/CampaignStateProvider'; // Import the provider component
import { initialNarrativeState } from '../../types/narrative.types';
import { initialGameState } from '../../types/gameState';
import { MockNarrativeProvider } from '../../test/utils/narrativeProviderMock';

// Create a test wrapper that provides both the CampaignStateContext and NarrativeProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockState = {
    ...initialGameState,
    narrative: {
      ...initialNarrativeState,
      storyProgression: {
        currentPoint: null,
        progressionPoints: { /* Intentionally empty */ },
        mainStorylinePoints: [],
        branchingPoints: { /* Intentionally empty */ },
        lastUpdated: Date.now()
      }
    }
  };

  // No longer need mockContextValue when using the actual provider

  return (
    // Use the actual provider component and pass initial state
    <CampaignStateProvider initialState={mockState}>
      <MockNarrativeProvider>
        {children}
      </MockNarrativeProvider>
    </CampaignStateProvider>
  );
};

describe('Narrative System', () => {
  describe('NarrativeDisplay Integration', () => {
    test('processes complete narrative correctly', () => {
      const narrative = `
        Player: draws weapon
        GM: You ready your weapon
        ACQUIRED_ITEMS: [Gun, Bullets]
        Player: aims carefully
        SUGGESTED_ACTIONS: [{"text": "Fire weapon", "type": "combat"}]
      `;
      
      render(
        <TestWrapper>
          <NarrativeDisplay narrative={narrative} />
        </TestWrapper>
      );
      
      // Check player actions
      const playerActions = screen.getAllByTestId('narrative-item-player-action');
      expect(playerActions).toHaveLength(2);
      expect(playerActions[0]).toHaveTextContent('draws weapon');
      expect(playerActions[1]).toHaveTextContent('aims carefully');
      
      // Check GM response
      expect(screen.getByTestId('narrative-item-gm-response')).toHaveTextContent('You ready your weapon');
      
      // Check item updates
      const itemUpdate = screen.getByTestId('item-update-acquired');
      expect(itemUpdate).toHaveTextContent(/Acquired Items:.*gun.*bullets|Acquired Items:.*bullets.*gun/i);
    });

    test('handles error display and retry', () => {
      const mockError = 'Test error';
      const mockRetry = jest.fn();
      
      render(
        <TestWrapper>
          <NarrativeDisplay
            narrative="Test narrative"
            error={mockError}
            onRetry={mockRetry}
          />
        </TestWrapper>
      );
      
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent(mockError);
      
      const retryButton = screen.getByText('Retry');
      retryButton.click();
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('NarrativeContent Core Functionality', () => {
    const processedUpdates = new Set<string>();

    beforeEach(() => {
      processedUpdates.clear();
    });

    test('handles all content types correctly', () => {
      const items: NarrativeItem[] = [
        {
          type: 'player-action',
          content: 'draws weapon'
        },
        {
          type: 'gm-response',
          content: 'You ready your weapon'
        },
        {
          type: 'item-update',
          content: '',
          metadata: {
            updateType: 'acquired',
            items: ['Gun', 'Bullets']
          }
        }
      ];

      items.forEach(item => {
        render(
          <NarrativeContent 
            item={item} 
            processedUpdates={processedUpdates}
          />
        );

        switch(item.type) {
          case 'player-action':
            expect(screen.getByTestId('narrative-item-player-action')).toHaveTextContent('draws weapon');
            break;
          case 'gm-response':
            expect(screen.getByTestId('narrative-item-gm-response')).toHaveTextContent('You ready your weapon');
            break;
          case 'item-update':
            expect(screen.getByTestId('item-update-acquired')).toHaveTextContent(/gun, bullets|bullets, gun/i);
            break;
        }
      });
    });
  });
});